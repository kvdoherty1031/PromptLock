import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../index';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Check for API key
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
      res.status(401).json({ success: false, error: 'API key required' });
      return;
    }

    // Validate API key (in production, check against database)
    if (apiKey !== process.env.API_KEY) {
      res.status(401).json({ success: false, error: 'Invalid API key' });
      return;
    }

    // Check for auth token
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const token = authHeader.split(' ')[1];
    
    try {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-change-me');
      
      // Add user info to request
      req.user = decoded as { id: string; email: string };
      
      next();
    } catch (error) {
      logger.error('Token verification failed:', error);
      res.status(401).json({ success: false, error: 'Invalid token' });
    }
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(500).json({ success: false, error: 'Authentication failed' });
  }
}; 