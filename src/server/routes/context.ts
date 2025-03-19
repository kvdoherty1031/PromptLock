import { Router } from 'express';
import { z } from 'zod';
import { APIError } from '../middleware/errorHandler';
import { logger } from '../index';
import { SalesforceAdapter } from '../adapters/salesforce';

const router = Router();

// Validation schema
const contextRequestSchema = z.object({
  services: z.array(z.string()),
  options: z.object({
    maxTokens: z.number().optional(),
    includeMetadata: z.boolean().optional()
  }).optional()
});

// Generate context from specified services
router.post('/', async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new APIError(401, 'User not found');
    }

    // Validate request
    const { services, options } = contextRequestSchema.parse(req.body);

    // Initialize context
    let context = '';
    const metadata: Record<string, any> = {};

    // Process each service
    for (const service of services) {
      try {
        const adapter = getAdapter(service);
        
        // Get resources for service
        const resources = await adapter.listResources();
        
        // Add service header to context
        context += `\n=== ${service.toUpperCase()} ===\n\n`;
        
        // Process each resource
        for (const resource of resources) {
          const content = await adapter.readResource(resource.url);
          context += `--- ${resource.name} ---\n`;
          context += content;
          context += '\n\n';

          // Store metadata if requested
          if (options?.includeMetadata) {
            metadata[service] = metadata[service] || {};
            metadata[service][resource.name] = {
              timestamp: new Date().toISOString(),
              size: content.length
            };
          }
        }
      } catch (error) {
        logger.error('Error getting context for service:', {
          service,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        
        // Add error to context
        context += `Error getting context for ${service}: ${error instanceof Error ? error.message : 'Unknown error'}\n\n`;
      }
    }

    // Trim context if maxTokens specified
    if (options?.maxTokens) {
      // Simple character-based truncation (replace with proper token counting in production)
      context = context.slice(0, options.maxTokens * 4); // Rough estimate of 4 chars per token
    }

    const response: any = {
      success: true,
      data: { context }
    };

    // Include metadata if requested
    if (options?.includeMetadata) {
      response.data.metadata = metadata;
    }

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Helper to get appropriate adapter for service
function getAdapter(type: string): any {
  switch (type.toLowerCase()) {
    case 'salesforce':
      return new SalesforceAdapter();
    default:
      throw new APIError(400, `Unsupported service type: ${type}`);
  }
}

export const contextRouter = router; 