import { Request, Response, NextFunction } from 'express';
import { logger } from '../index';

// Custom error class for API errors
export class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
export const errorHandler = (
  err: Error | APIError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Handle API errors
  if (err instanceof APIError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message
    });
    return;
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      error: 'Validation error',
      details: err.message
    });
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
    return;
  }

  // Handle unknown errors
  res.status(500).json({
    success: false,
    error: 'An unexpected error occurred'
  });
}; 