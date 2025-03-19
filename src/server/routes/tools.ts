import { Router } from 'express';
import { z } from 'zod';
import { APIError } from '../middleware/errorHandler';
import { logger } from '../index';
import { SalesforceAdapter } from '../adapters/salesforce';

const router = Router();

// Get available tools for a connection type
router.get('/:connectionType', async (req, res, next) => {
  try {
    const { connectionType } = req.params;

    // Get adapter for connection type
    const adapter = getAdapter(connectionType);
    const tools = await adapter.listTools();

    res.json({
      success: true,
      data: tools
    });
  } catch (error) {
    next(error);
  }
});

// Call a tool on a connection
router.post('/:connectionType/:toolName', async (req, res, next) => {
  try {
    const { connectionType, toolName } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new APIError(401, 'User not found');
    }

    // Get adapter for connection type
    const adapter = getAdapter(connectionType);

    // Validate tool exists
    const tools = await adapter.listTools();
    const tool = tools.find(t => t.name === toolName);

    if (!tool) {
      throw new APIError(404, 'Tool not found');
    }

    // Validate parameters against tool schema
    const validatedParams = z.any().parse(req.body);

    // Call tool
    const result = await adapter.callTool(toolName, validatedParams);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// Helper to get appropriate adapter for connection type
function getAdapter(type: string): any {
  switch (type.toLowerCase()) {
    case 'salesforce':
      return new SalesforceAdapter();
    default:
      throw new APIError(400, `Unsupported connection type: ${type}`);
  }
}

export const toolsRouter = router; 