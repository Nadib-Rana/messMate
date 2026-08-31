import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { Request } from "express";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger("HTTP");

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const { method, url, ip } = req;
    const user = (req as any).user;
    const userIdentifier = user ? `${user.email || user.username || user.id}` : "Anonymous/Guest";
    const userAgent = req.get("user-agent") || "";
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const res = ctx.getResponse();
          const statusCode = res.statusCode;
          const duration = Date.now() - now;
          this.logger.log(
            `🌐 [${method}] ${url} | Status: ${statusCode} | Time: ${duration}ms | Caller: ${userIdentifier} | IP: ${ip}`,
          );
        },
        error: (err) => {
          const duration = Date.now() - now;
          this.logger.error(
            `❌ [${method}] ${url} | Error: ${err.status || 500} (${err.message}) | Time: ${duration}ms | Caller: ${userIdentifier}`,
          );
        },
      }),
    );
  }
}
