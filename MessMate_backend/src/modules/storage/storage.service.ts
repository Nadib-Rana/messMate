import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Client as MinioClient } from "minio";
import * as path from "path";
import * as crypto from "crypto";

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private minioClient: MinioClient | null = null;
  private readonly defaultBucket: string;
  private readonly defaultExpirySeconds = 900;

  constructor(private readonly configService: ConfigService) {
    this.defaultBucket = this.configService.get<string>("storage.bucket", "messmate-uploads");
  }

  async onModuleInit() {
    const endPoint = this.configService.get<string>("storage.endpoint");
    const port = this.configService.get<number>("storage.port", 9000);
    const useSSL = this.configService.get<boolean>("storage.useSSL", false);
    const accessKey = this.configService.get<string>("storage.accessKey");
    const secretKey = this.configService.get<string>("storage.secretKey");

    if (endPoint && accessKey && secretKey) {
      try {
        this.minioClient = new MinioClient({ endPoint, port, useSSL, accessKey, secretKey });
        const exists = await this.minioClient.bucketExists(this.defaultBucket);
        if (!exists) {
          const region = this.configService.get<string>("storage.region", "us-east-1");
          await this.minioClient.makeBucket(this.defaultBucket, region);
        }
        this.logger.log("✅ Object storage (MinIO/S3) configured successfully");
      } catch (err) {
        this.logger.warn("⚠️ Object storage fallback enabled");
      }
    }
  }

  isConfigured(): boolean { return this.minioClient !== null; }

  generateKey(folder = "uploads", originalName = "file"): string {
    const ext = path.extname(originalName);
    const randomHash = crypto.randomBytes(8).toString("hex");
    return `${folder}/${Date.now()}-${randomHash}${ext}`;
  }

  getObjectUrl(key: string, bucket?: string): string {
    if (!key || key.startsWith("http://") || key.startsWith("https://") || key.startsWith("data:")) return key;
    const publicUrl = this.configService.get<string>("storage.publicUrl", "");
    const b = bucket || this.defaultBucket;
    return publicUrl ? `${publicUrl.replace(/\/$/, "")}/${b}/${key.replace(/^\//, "")}` : key;
  }

  async getPresignedUploadUrl(key: string, bucket?: string, expirySeconds?: number): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
    const b = bucket || this.defaultBucket;
    const expiry = expirySeconds || this.defaultExpirySeconds;
    if (!this.minioClient) {
      const fallbackUrl = this.getObjectUrl(key, b);
      return { uploadUrl: fallbackUrl, key, publicUrl: fallbackUrl };
    }
    const uploadUrl = await this.minioClient.presignedPutObject(b, key, expiry);
    const publicUrl = this.getObjectUrl(key, b);
    return { uploadUrl, key, publicUrl };
  }

  async getPresignedObjectUrl(key: string, bucket?: string, expirySeconds?: number): Promise<string> {
    const b = bucket || this.defaultBucket;
    const expiry = expirySeconds || this.defaultExpirySeconds;
    if (!this.minioClient) return this.getObjectUrl(key, b);
    return this.minioClient.presignedGetObject(b, key, expiry);
  }

  async uploadBuffer(key: string, buffer: Buffer, contentType = "application/octet-stream", bucket?: string): Promise<string> {
    const b = bucket || this.defaultBucket;
    if (!this.minioClient) return this.getObjectUrl(key, b);
    await this.minioClient.putObject(b, key, buffer, buffer.length, { "Content-Type": contentType });
    return this.getObjectUrl(key, b);
  }

  async deleteObject(key: string, bucket?: string): Promise<void> {
    if (!this.minioClient) return;
    await this.minioClient.removeObject(bucket || this.defaultBucket, key);
  }
}
