import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe, Logger, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import helmet from "helmet";
import { json, urlencoded } from "express";
import { setupSwagger } from "./swagger.setup";

async function bootstrap() {
  const logger = new Logger("Bootstrap");
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>("app.port", 3000);
  const apiPrefix = configService.get<string>("app.apiPrefix", "api/v1");
  const appName = configService.get<string>("app.name", "MessMate API");
  const isProd = configService.get<string>("app.nodeEnv") === "production";

  app.use(helmet({ crossOriginEmbedderPolicy: false, contentSecurityPolicy: isProd ? undefined : false }));
  app.use(json({ limit: "50mb" }));
  app.use(urlencoded({ extended: true, limit: "50mb" }));

  const corsOrigins = configService.get<string | string[]>("app.corsOrigins", "*");
  app.enableCors({
    origin: corsOrigins === "*" ? true : corsOrigins,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "x-request-id", "ngrok-skip-browser-warning"],
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
        return new BadRequestException({ statusCode: 400, message: "Request validation failed", errorCode: "VALIDATION_FAILED", errors: formatErrors(errors) });
      },
    }),
  );

  setupSwagger(app, configService, port);
  app.enableShutdownHooks();

  await app.listen(port);
  logger.log(`🚀 ${appName} server running at: http://localhost:${port}/${apiPrefix}`);
}

void bootstrap();
