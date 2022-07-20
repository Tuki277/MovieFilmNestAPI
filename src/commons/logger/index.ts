import { Request } from 'express';
import { getDateTimeNow } from 'src/helpers';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

export const log = (
  req: Request,
  message: string,
  level: 'error' | 'info' | 'warn',
) => {
  const { combine, printf } = winston.format;

  const transportApi = new winston.transports.DailyRotateFile({
    filename: 'logs/api.%DATE%.log',
    datePattern: 'YYYY-MM-DD',
  });

  const formatLog = printf(({ level, message }) => {
    return `[${getDateTimeNow()}] [${req.originalUrl}] ${level}: ${message}`;
  });

  const logger = winston.createLogger({
    format: combine(formatLog),
    transports: [transportApi],
  });

  const loggerDev = winston.createLogger({
    format: combine(formatLog),
    transports: [new winston.transports.Console()],
  });

  if (process.env.NODE_ENV === 'development') {
    loggerDev[level](message);
  } else {
    logger[level](message);
  }
};
