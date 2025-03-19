import { Router } from 'express';
import { z } from 'zod';
import { APIError } from '../middleware/errorHandler';
import { logger } from '../index';

const router = Router();

// Validation schemas
const connectionSchema = z.object({
  type: z.string(),
  credentials: z.record(z.any())
});

// In-memory connection store (replace with database in production)
const connections = new Map<string, {
  id: string;
  type: string;
  credentials: any;
  userId: string;
}>();

// List connections
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new APIError(401, 'User not found');
    }

    // Get all connections for user
    const userConnections = Array.from(connections.values())
      .filter(conn => conn.userId === userId)
      .map(conn => ({
        id: conn.id,
        type: conn.type
        // Don't send credentials back
      }));

    res.json({
      success: true,
      data: userConnections
    });
  } catch (error) {
    next(error);
  }
});

// Add connection
router.post('/', async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new APIError(401, 'User not found');
    }

    // Validate input
    const { type, credentials } = connectionSchema.parse(req.body);

    // Create connection
    const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    connections.set(connectionId, {
      id: connectionId,
      type,
      credentials,
      userId
    });

    logger.info('Connection added:', { type, userId });

    res.status(201).json({
      success: true,
      data: {
        connectionId,
        type
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get connection
router.get('/:connectionId', async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new APIError(401, 'User not found');
    }

    const { connectionId } = req.params;
    const connection = connections.get(connectionId);

    if (!connection) {
      throw new APIError(404, 'Connection not found');
    }

    if (connection.userId !== userId) {
      throw new APIError(403, 'Access denied');
    }

    res.json({
      success: true,
      data: {
        id: connection.id,
        type: connection.type
        // Don't send credentials back
      }
    });
  } catch (error) {
    next(error);
  }
});

// Delete connection
router.delete('/:connectionId', async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new APIError(401, 'User not found');
    }

    const { connectionId } = req.params;
    const connection = connections.get(connectionId);

    if (!connection) {
      throw new APIError(404, 'Connection not found');
    }

    if (connection.userId !== userId) {
      throw new APIError(403, 'Access denied');
    }

    connections.delete(connectionId);
    logger.info('Connection deleted:', { connectionId, userId });

    res.json({
      success: true,
      message: 'Connection deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export const connectionsRouter = router; 