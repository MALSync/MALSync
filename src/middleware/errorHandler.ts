import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (err.name === 'ValidationError') {
    res.status(400).json({
      error: 'Validation error',
      details: isDevelopment ? err.message : 'Invalid request data'
    });
    return;
  }

  if (err.name === 'CastError') {
    res.status(400).json({
      error: 'Invalid ID format',
      details: isDevelopment ? err.message : 'The provided ID is not valid'
    });
    return;
  }

  if (err.status && err.status < 500) {
    res.status(err.status).json({
      error: err.message || 'Client error'
    });
    return;
  }

  // Default to 500 server error
  res.status(500).json({
    error: 'Internal server error',
    details: isDevelopment ? err.message : 'Something went wrong on our end'
  });
}
