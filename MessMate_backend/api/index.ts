import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { AppModule } from "../src/app.module";
import { ValidationPipe, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AllExceptionsFilter } from "../src/common/filters/all-exceptions.filter";
import { PrismaClientExceptionFilter } from "../src/common/filters/prisma-client-exception.filter";
import { ContextService } from "../src/common/context/context.service";
import { ExpressAdapter } from "@nestjs/platform-express";
import { setupSwagger } from "../src/swagger.setup";
import express from "express";

const server = express();
let cachedApp: any;

async function bootstrap() {
  if (!cachedApp) {
    const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
    const configService = app.get(ConfigService);

    const apiPrefix = configService.get<string>("app.apiPrefix", "api/v1");

    app.use(express.json({ limit: "50mb" }));
    app.use(express.urlencoded({ extended: true, limit: "50mb" }));

    const corsOrigins = configService.get<string | string[]>("app.corsOrigins", "*");
    const isWildcard = corsOrigins === "*" || (Array.isArray(corsOrigins) && corsOrigins.includes("*"));

    app.enableCors({
      origin: isWildcard ? true : corsOrigins,
      methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "x-request-id",
        "ngrok-skip-browser-warning",
      ],
    });

    app.setGlobalPrefix(apiPrefix, { exclude: ["/", "docs", "docs-json"] });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: { enableImplicitConversion: true },
        exceptionFactory: (errors) => {
          const formatErrors = (errs: typeof errors) => {
            return errs.map((err) => {
              if (err.constraints) return { field: err.property, errors: Object.values(err.constraints) };
              if (err.children && err.children.length > 0) return { field: err.property, children: formatErrors(err.children) };
              return { field: err.property, errors: [`Validation failed for ${err.property}`] };
            });
          };
          return new BadRequestException({
            statusCode: 400,
            message: "Request validation failed",
            errorCode: "VALIDATION_FAILED",
            errors: formatErrors(errors),
          });
        },
      }),
    );

    const httpAdapterHost = app.get(HttpAdapterHost);
    const contextService = app.get(ContextService);
    app.useGlobalFilters(
      new AllExceptionsFilter(httpAdapterHost, contextService),
      new PrismaClientExceptionFilter(contextService),
    );

    setupSwagger(app, configService, 3000);

    await app.init();
    cachedApp = app;
  }
  return cachedApp;
}

export default async function handler(req: any, res: any) {
  await bootstrap();
  server(req, res);
}
