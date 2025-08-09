import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { WinstonLoggerService } from '../logger/winston.config';
import {
  isSensitiveUrl,
  redactHeaders,
  redactSensitiveData,
  sanitizeUrl
} from '../utils/data-redaction.util';

export const REQUEST_ID_HEADER = 'x-request-id';
export const REQUEST_ID_KEY = 'requestId';

@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  constructor(private readonly logger: WinstonLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    // Generate or use existing request ID
    const requestId = request.headers[REQUEST_ID_HEADER] || uuidv4();
    
    // Add request ID to request object for use in other parts of the app
    request[REQUEST_ID_KEY] = requestId;
    
    // Add request ID to response headers
    response.setHeader(REQUEST_ID_HEADER, requestId);

    const startTime = Date.now();
    const { method, url, ip, headers, body, query } = request;
    const userAgent = headers['user-agent'] || 'unknown';

    // Sanitize URL and headers for logging
    const sanitizedUrl = sanitizeUrl(url);
    const redactedHeaders = redactHeaders(headers);
    const isSensitive = isSensitiveUrl(url);

    // Log request start with redacted sensitive data
    const logData: any = {
      requestId,
      method,
      url: sanitizedUrl,
      ip,
      userAgent,
      type: 'request_start'
    };

    // Only log headers and body for non-sensitive URLs or in redacted form
    if (!isSensitive) {
      logData.headers = redactedHeaders;
      if (body && Object.keys(body).length > 0) {
        logData.body = redactSensitiveData(body);
      }
      if (query && Object.keys(query).length > 0) {
        logData.query = redactSensitiveData(query);
      }
    }

    this.logger.info('Request started', logData);

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          const { statusCode } = response;

          // Prepare log data with potential redaction
          const logMetadata: any = {
            ip,
            userAgent,
            responseSize: data ? JSON.stringify(data).length : 0,
          };

          // Only log response data for non-sensitive URLs and redact if needed
          if (!isSensitive && data) {
            logMetadata.response = redactSensitiveData(data);
          }

          // Log successful request completion
          this.logger.logRequest(
            requestId,
            method,
            sanitizedUrl,
            statusCode,
            duration,
            logMetadata
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const statusCode = error.status || 500;

          // Prepare error log data
          const errorLogData: any = {
            requestId,
            method,
            url: sanitizedUrl,
            statusCode,
            duration: `${duration}ms`,
            ip,
            userAgent,
            error: error.message,
            type: 'request_error'
          };

          // Only include stack trace for non-sensitive URLs
          if (!isSensitive) {
            errorLogData.stack = error.stack;
          }

          // Log error request completion
          this.logger.error('Request failed', errorLogData);
        }
      })
    );
  }
}