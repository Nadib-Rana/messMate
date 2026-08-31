import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log:
        process.env.NODE_ENV === "development"
          ? ["warn", "error"]
          : ["error"],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log("✅ Successfully connected to the PostgreSQL database");
    } catch (error) {
      this.logger.warn(
        "⚠️ Database connection not established at startup (will retry on query)",
        error instanceof Error ? error.message : error,
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log("Database connection disconnected gracefully");
  }
}
