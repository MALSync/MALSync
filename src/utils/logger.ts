import winston from 'winston';
import path from 'path';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
  })
);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: consoleFormat
    })
  ],
});

// Add file transport in production
if (process.env.NODE_ENV === 'production' && process.env.LOG_FILE) {
  logger.add(new winston.transports.File({
    filename: process.env.LOG_FILE,
    format: logFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }));
}

// Create a simplified console-like interface for compatibility
export const con = {
  log: (...args: any[]) => logger.info(args.join(' ')),
  info: (...args: any[]) => logger.info(args.join(' ')),
  warn: (...args: any[]) => logger.warn(args.join(' ')),
  error: (...args: any[]) => logger.error(args.join(' ')),
  debug: (...args: any[]) => logger.debug(args.join(' ')),
  m: (module: string, color?: string) => ({
    log: (...args: any[]) => logger.info(`[${module}] ${args.join(' ')}`),
    info: (...args: any[]) => logger.info(`[${module}] ${args.join(' ')}`),
    warn: (...args: any[]) => logger.warn(`[${module}] ${args.join(' ')}`),
    error: (...args: any[]) => logger.error(`[${module}] ${args.join(' ')}`),
    debug: (...args: any[]) => logger.debug(`[${module}] ${args.join(' ')}`),
    m: (submodule: string) => ({
      log: (...args: any[]) => logger.info(`[${module}:${submodule}] ${args.join(' ')}`),
      info: (...args: any[]) => logger.info(`[${module}:${submodule}] ${args.join(' ')}`),
      warn: (...args: any[]) => logger.warn(`[${module}:${submodule}] ${args.join(' ')}`),
      error: (...args: any[]) => logger.error(`[${module}:${submodule}] ${args.join(' ')}`),
      debug: (...args: any[]) => logger.debug(`[${module}:${submodule}] ${args.join(' ')}`),
    })
  })
};
