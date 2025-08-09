import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { createSafeLogObject } from '../utils/data-redaction.util';

@Injectable()
export class WinstonLoggerService {
  private readonly logger: winston.Logger;

  constructor(private configService: ConfigService) {
    this.logger = this.createLogger();
  }

  private createLogger(): winston.Logger {
    const logLevel = this.configService.get<string>('LOG_LEVEL', 'info');
    const logDir = this.configService.get<string>('LOG_DIR', 'logs');

    // Console format for development
    const consoleFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, requestId, ...meta }) => {
        const requestIdStr = requestId ? `[${requestId}]` : '';
        const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
        return `${timestamp} ${level} ${requestIdStr} ${message}${metaStr}`;
      })
    );

    // File format for production
    const fileFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    );

    const transports: winston.transport[] = [];

    // Always add console transport for development
    if (this.configService.get<string>('NODE_ENV') !== 'production') {
      transports.push(
        new winston.transports.Console({
          format: consoleFormat,
          level: logLevel,
        })
      );
    }

    // Add file transports
    transports.push(
      // Combined logs (all levels)
      new DailyRotateFile({
        filename: `${logDir}/app-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14d',
        format: fileFormat,
        level: logLevel,
      }),

      // Error logs only
      new DailyRotateFile({
        filename: `${logDir}/error-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '30d',
        format: fileFormat,
        level: 'error',
      }),

      // Request logs
      new DailyRotateFile({
        filename: `${logDir}/requests-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        maxSize: '50m',
        maxFiles: '7d',
        format: fileFormat,
        level: 'info',
      })
    );

    return winston.createLogger({
      level: logLevel,
      format: fileFormat,
      transports,
      exceptionHandlers: [
        new DailyRotateFile({
          filename: `${logDir}/exceptions-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '30d',
          format: fileFormat,
        })
      ],
      rejectionHandlers: [
        new DailyRotateFile({
          filename: `${logDir}/rejections-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '30d',
          format: fileFormat,
        })
      ],
    });
  }

  log(level: string, message: string, meta?: any) {
    const safeMeta = meta ? createSafeLogObject(meta) : meta;
    this.logger.log(level, message, safeMeta);
  }

  info(message: string, meta?: any) {
    const safeMeta = meta ? createSafeLogObject(meta) : meta;
    this.logger.info(message, safeMeta);
  }

  warn(message: string, meta?: any) {
    const safeMeta = meta ? createSafeLogObject(meta) : meta;
    this.logger.warn(message, safeMeta);
  }

  error(message: string, meta?: any) {
    const safeMeta = meta ? createSafeLogObject(meta) : meta;
    this.logger.error(message, safeMeta);
  }

  debug(message: string, meta?: any) {
    const safeMeta = meta ? createSafeLogObject(meta) : meta;
    this.logger.debug(message, safeMeta);
  }

  logRequest(requestId: string, method: string, url: string, statusCode: number, duration: number, meta?: any) {
    const safeMeta = meta ? createSafeLogObject(meta) : {};
    this.logger.info('HTTP Request', {
      requestId,
      method,
      url,
      statusCode,
      duration: `${duration}ms`,
      type: 'request',
      ...safeMeta
    });
  }
}