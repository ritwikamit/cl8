import winston from 'winston';
import path from 'node:path';
import fs from 'node:fs';
import { LogLevel } from '../types/config.js';

const LOG_DIR = path.resolve(process.cwd(), 'logs');

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level.toUpperCase().padEnd(7)}: ${message}${metaStr}`;
  })
);

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message }) => {
    return `${timestamp} ${level}: ${message}`;
  })
);

let logger: winston.Logger;

export function createLogger(level: LogLevel = 'info'): winston.Logger {
  if (logger) return logger;

  logger = winston.createLogger({
    level,
    transports: [
      new winston.transports.File({
        filename: path.join(LOG_DIR, 'error.log'),
        level: 'error',
        format: logFormat,
        maxsize: 5 * 1024 * 1024,
        maxFiles: 5,
      }),
      new winston.transports.File({
        filename: path.join(LOG_DIR, 'combined.log'),
        format: logFormat,
        maxsize: 5 * 1024 * 1024,
        maxFiles: 5,
      }),
      new winston.transports.Console({
        format: consoleFormat,
        silent: true,
      }),
    ],
  });

  return logger;
}

export function getLogger(): winston.Logger {
  if (!logger) {
    return createLogger();
  }
  return logger;
}

export { logger };
