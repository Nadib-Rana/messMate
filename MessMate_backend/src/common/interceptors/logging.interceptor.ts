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
    const { method, url, ip, body, query } = req;
    const user = (req as any).user;
    const userIdentifier = user ? `${user.email || user.username || user.id}` : "Anonymous/Guest";
    const now = Date.now();

    const bodyKeys = body && typeof body === "object" ? Object.keys(body).filter(k => !k.toLowerCase().includes("password")) : [];
    const queryKeys = query && typeof query === "object" ? Object.keys(query) : [];
    const metaStr = bodyKeys.length > 0 ? ` | Payload: [${bodyKeys.join(", ")}]` : queryKeys.length > 0 ? ` | Query: ${JSON.stringify(query)}` : "";

    return next.handle().pipe(
      tap({
        next: () => {
          const res = ctx.getResponse();
          const statusCode = res.statusCode;
          const duration = Date.now() - now;
          this.logger.log(
            `📡 [${method}] ${url}${metaStr} ➔ Status: ${statusCode} (${duration}ms) | User: ${userIdentifier} [IP: ${ip}]`,
          );
        },
        error: (err) => {
          const duration = Date.now() - now;
          this.logger.error(
            `❌ [${method}] ${url}${metaStr} ➔ Error: ${err.status || 500} (${err.message}) (${duration}ms) | User: ${userIdentifier}`,
          );
        },
      }),
    );
  }
}
