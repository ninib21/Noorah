import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

@Injectable()
export class LoggingService implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      defaultMeta: { service: 'nannyradar-api' },
      transports: [
        // Console transport
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
        // File transport for errors
        new DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          maxSize: '20m',
          maxFiles: '14d',
        }),
        // File transport for all logs
        new DailyRotateFile({
          filename: 'logs/combined-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '14d',
        }),
      ],
    });
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }

  // Custom logging methods
  logUserAction(userId: string, action: string, metadata?: any) {
    this.logger.info('User action', {
      userId,
      action,
      timestamp: new Date().toISOString(),
      metadata,
    });
  }

  logSecurityEvent(event: string, details: any) {
    this.logger.warn('Security event', {
      event,
      timestamp: new Date().toISOString(),
      details,
    });
  }

  logPerformance(operation: string, duration: number, metadata?: any) {
    this.logger.info('Performance metric', {
      operation,
      duration,
      timestamp: new Date().toISOString(),
      metadata,
    });
  }

  logDatabaseQuery(query: string, duration: number, params?: any) {
    this.logger.debug('Database query', {
      query,
      duration,
      params,
      timestamp: new Date().toISOString(),
    });
  }
} 