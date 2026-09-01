import { INestApplication, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export function setupSwagger(app: INestApplication, configService: ConfigService, port: number) {
  const swaggerEnabled = configService.get<boolean>("swagger.enabled", true);
  if (!swaggerEnabled) return;

  const appName = configService.get<string>("app.name", "MessMate API");
  const swaggerPath = configService.get<string>("swagger.path", "docs");
  const swaggerTitle = configService.get<string>("swagger.title", appName);
  const swaggerDescription = configService.get<string>("swagger.description", "MessMate RESTful API");
  const swaggerVersion = configService.get<string>("swagger.version", "1.0.0");

  const swaggerConfig = new DocumentBuilder()
    .setTitle(swaggerTitle)
    .setDescription(swaggerDescription)
    .setVersion(swaggerVersion)
    .addBearerAuth({ type: "http", scheme: "bearer", bearerFormat: "JWT", name: "Authorization", in: "header" }, "bearer")
    .addTag("Authentication", "User auth, tokens, OTP")
    .addTag("Meals", "Daily meals, weekly plans, guest meals")
    .addTag("Market", "Market duties and grocery expenses")
    .addTag("Finance", "Wallets, payments, and expenses")
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(swaggerPath, app, document, {
    swaggerOptions: { persistAuthorization: true, docExpansion: "list", filter: true },
  });

  new Logger("Swagger").log(`📚 Swagger documentation at: http://localhost:${port}/${swaggerPath}`);
}
