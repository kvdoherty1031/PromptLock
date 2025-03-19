import jsforce from 'jsforce';
import { z } from 'zod';
import { APIError } from '../middleware/errorHandler';
import { logger } from '../index';

// Type definitions
export interface SalesforceCredentials {
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
}

export interface SalesforceTool {
  name: string;
  description: string;
  inputSchema: z.ZodSchema;
}

// Validation schemas
const credentialsSchema = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
  username: z.string(),
  password: z.string()
});

// Tool definitions
const SALESFORCE_TOOLS: SalesforceTool[] = [
  {
    name: 'query_records',
    description: 'Execute a SOQL query to retrieve Salesforce records',
    inputSchema: z.object({
      soql: z.string(),
      limit: z.number().optional()
    })
  },
  {
    name: 'get_record',
    description: 'Retrieve a single Salesforce record by ID',
    inputSchema: z.object({
      objectType: z.string(),
      recordId: z.string(),
      fields: z.array(z.string()).optional()
    })
  },
  {
    name: 'describe_object',
    description: 'Get metadata about a Salesforce object',
    inputSchema: z.object({
      objectType: z.string()
    })
  }
];

// Resource definitions
const SALESFORCE_RESOURCES = [
  {
    name: 'schema',
    description: 'Salesforce schema information including objects and their fields',
    url: 'schema'
  },
  {
    name: 'recent_items',
    description: 'Recently accessed items in Salesforce',
    url: 'recent_items'
  }
];

export class SalesforceAdapter {
  private conn: jsforce.Connection;
  private isConnected: boolean = false;
  private objectsMetadata: Map<string, any> = new Map();

  constructor(private credentials?: SalesforceCredentials) {
    if (credentials) {
      this.conn = new jsforce.Connection({
        oauth2: {
          clientId: credentials.clientId,
          clientSecret: credentials.clientSecret
        }
      });
    }
  }

  /**
   * Ensure connection to Salesforce
   */
  private async ensureConnection(): Promise<void> {
    if (!this.isConnected) {
      if (!this.credentials) {
        throw new APIError(400, 'Salesforce credentials not provided');
      }

      try {
        await this.conn.login(this.credentials.username, this.credentials.password);
        this.isConnected = true;
      } catch (error) {
        logger.error('Failed to connect to Salesforce:', error);
        throw new APIError(500, 'Failed to authenticate with Salesforce');
      }
    }
  }

  /**
   * List available tools
   */
  async listTools(): Promise<SalesforceTool[]> {
    return SALESFORCE_TOOLS;
  }

  /**
   * List available resources
   */
  async listResources(): Promise<typeof SALESFORCE_RESOURCES> {
    return SALESFORCE_RESOURCES;
  }

  /**
   * Read a resource
   */
  async readResource(resourceUrl: string): Promise<string> {
    await this.ensureConnection();

    try {
      switch (resourceUrl) {
        case 'schema':
          const objects = await this.getGlobalObjects();
          return JSON.stringify(objects, null, 2);

        case 'recent_items':
          const recentItems = await this.conn.recent();
          return JSON.stringify(recentItems, null, 2);

        default:
          throw new APIError(404, `Unknown resource: ${resourceUrl}`);
      }
    } catch (error) {
      if (error instanceof APIError) throw error;
      logger.error('Error reading Salesforce resource:', error);
      throw new APIError(500, 'Failed to read Salesforce resource');
    }
  }

  /**
   * Call a tool
   */
  async callTool(toolName: string, parameters: any): Promise<any> {
    await this.ensureConnection();

    const tool = SALESFORCE_TOOLS.find(t => t.name === toolName);
    if (!tool) {
      throw new APIError(404, `Tool not found: ${toolName}`);
    }

    try {
      // Validate parameters against tool schema
      const validatedParams = tool.inputSchema.parse(parameters);

      switch (toolName) {
        case 'query_records':
          return this.queryRecords(validatedParams.soql, validatedParams.limit);

        case 'get_record':
          return this.getRecord(
            validatedParams.objectType,
            validatedParams.recordId,
            validatedParams.fields
          );

        case 'describe_object':
          return this.describeObject(validatedParams.objectType);

        default:
          throw new APIError(400, `Unsupported tool: ${toolName}`);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new APIError(400, `Invalid parameters: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Execute a SOQL query
   */
  private async queryRecords(soql: string, limit?: number): Promise<any> {
    try {
      let query = soql;
      if (limit && !soql.toLowerCase().includes('limit')) {
        query += ` LIMIT ${limit}`;
      }

      const result = await this.conn.query(query);
      return {
        totalSize: result.totalSize,
        records: result.records
      };
    } catch (error) {
      logger.error('SOQL query error:', error);
      throw new APIError(400, `Failed to execute query: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get a single record
   */
  private async getRecord(objectType: string, recordId: string, fields?: string[]): Promise<any> {
    try {
      if (fields && fields.length > 0) {
        return await this.conn.sobject(objectType).retrieve(recordId, fields);
      }
      return await this.conn.sobject(objectType).retrieve(recordId);
    } catch (error) {
      logger.error('Record retrieval error:', error);
      throw new APIError(400, `Failed to retrieve record: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Describe a Salesforce object
   */
  private async describeObject(objectType: string): Promise<any> {
    try {
      if (this.objectsMetadata.has(objectType)) {
        return this.objectsMetadata.get(objectType);
      }

      const metadata = await this.conn.describe(objectType);
      this.objectsMetadata.set(objectType, metadata);
      return metadata;
    } catch (error) {
      logger.error('Object description error:', error);
      throw new APIError(400, `Failed to describe object: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get global objects list
   */
  private async getGlobalObjects(): Promise<any> {
    try {
      const result = await this.conn.describeGlobal();
      return result.sobjects.map(obj => ({
        name: obj.name,
        label: obj.label,
        custom: obj.custom,
        queryable: obj.queryable
      }));
    } catch (error) {
      logger.error('Global objects retrieval error:', error);
      throw new APIError(500, 'Failed to retrieve Salesforce objects');
    }
  }
} 