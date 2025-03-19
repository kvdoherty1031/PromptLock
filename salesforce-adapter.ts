import jsforce from 'jsforce';

// Define types for MCP messages
interface McpMessage {
  type: 'discover' | 'list_resources' | 'read_resource' | 'list_tools' | 'call_tool';
  id: string;
  [key: string]: any;
}

interface McpResponse {
  type: string;
  id: string;
  [key: string]: any;
}

// Salesforce tool definitions
const SALESFORCE_TOOLS = [
  {
    name: 'query_records',
    description: 'Execute a SOQL query to retrieve Salesforce records',
    inputSchema: {
      type: 'object',
      required: ['soql'],
      properties: {
        soql: {
          type: 'string',
          description: 'SOQL query to execute'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of records to return'
        }
      }
    }
  },
  {
    name: 'get_record',
    description: 'Retrieve a single Salesforce record by ID',
    inputSchema: {
      type: 'object',
      required: ['objectType', 'recordId'],
      properties: {
        objectType: {
          type: 'string',
          description: 'Salesforce object type (e.g., Account, Contact, Opportunity)'
        },
        recordId: {
          type: 'string',
          description: 'ID of the record to retrieve'
        },
        fields: {
          type: 'array',
          items: {
            type: 'string'
          },
          description: 'Fields to retrieve (optional)'
        }
      }
    }
  },
  {
    name: 'describe_object',
    description: 'Get metadata about a Salesforce object',
    inputSchema: {
      type: 'object',
      required: ['objectType'],
      properties: {
        objectType: {
          type: 'string',
          description: 'Salesforce object type (e.g., Account, Contact, Opportunity)'
        }
      }
    }
  }
];

// Salesforce resource definitions
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
  private conn: any;
  private isConnected: boolean = false;
  private objectsMetadata: Map<string, any> = new Map();

  constructor(private credentials: { clientId: string; clientSecret: string; username: string; password: string; }) {
    this.conn = new jsforce.Connection({
      oauth2: {
        clientId: credentials.clientId,
        clientSecret: credentials.clientSecret
      }
    });
  }

  private async ensureConnection() {
    if (!this.isConnected) {
      try {
        await this.conn.login(this.credentials.username, this.credentials.password);
        this.isConnected = true;
      } catch (error) {
        console.error('Failed to connect to Salesforce:', error);
        throw new Error('Failed to authenticate with Salesforce');
      }
    }
  }

  async handleMcpMessage(message: McpMessage): Promise<McpResponse> {
    switch (message.type) {
      case 'discover':
        return this.handleDiscover(message);
      case 'list_resources':
        return this.handleListResources(message);
      case 'read_resource':
        return this.handleReadResource(message);
      case 'list_tools':
        return this.handleListTools(message);
      case 'call_tool':
        return this.handleCallTool(message);
      default:
        throw new Error(`Unsupported message type: ${message.type}`);
    }
  }

  private handleDiscover(message: McpMessage): McpResponse {
    return {
      type: 'discover_response',
      id: message.id,
      name: 'Salesforce',
      version: '1.0.0',
      capabilities: ['resources', 'tools']
    };
  }

  private handleListResources(message: McpMessage): McpResponse {
    return {
      type: 'list_resources_response',
      id: message.id,
      resources: SALESFORCE_RESOURCES
    };
  }

  private async handleReadResource(message: McpMessage): Promise<McpResponse> {
    await this.ensureConnection();

    const resourceUrl = message.resource;
    
    if (resourceUrl === 'schema') {
      // Fetch schema information
      const objects = await this.getGlobalObjects();
      return {
        type: 'read_resource_response',
        id: message.id,
        content: JSON.stringify(objects, null, 2)
      };
    } else if (resourceUrl === 'recent_items') {
      // Fetch recent items
      const recentItems = await this.conn.recent();
      return {
        type: 'read_resource_response',
        id: message.id,
        content: JSON.stringify(recentItems, null, 2)
      };
    } else {
      throw new Error(`Unknown resource: ${resourceUrl}`);
    }
  }

  private handleListTools(message: McpMessage): McpResponse {
    return {
      type: 'list_tools_response',
      id: message.id,
      tools: SALESFORCE_TOOLS
    };
  }

  private async handleCallTool(message: McpMessage): Promise<McpResponse> {
    await this.ensureConnection();
    
    const toolName = message.tool;
    const params = message.parameters;

    switch (toolName) {
      case 'query_records':
        const results = await this.queryRecords(params.soql, params.limit);
        return {
          type: 'call_tool_response',
          id: message.id,
          result: results
        };
      
      case 'get_record':
        const record = await this.getRecord(params.objectType, params.recordId, params.fields);
        return {
          type: 'call_tool_response',
          id: message.id,
          result: record
        };
      
      case 'describe_object':
        const metadata = await this.describeObject(params.objectType);
        return {
          type: 'call_tool_response',
          id: message.id,
          result: metadata
        };
      
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  // Helper methods to interact with Salesforce
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
      console.error('SOQL query error:', error);
      throw new Error(`Failed to execute query: ${error.message}`);
    }
  }

  private async getRecord(objectType: string, recordId: string, fields?: string[]): Promise<any> {
    try {
      if (fields && fields.length > 0) {
        // If fields specified, use retrieve
        const result = await this.conn.sobject(objectType).retrieve(recordId, fields);
        return result;
      } else {
        // Otherwise, get all fields
        const result = await this.conn.sobject(objectType).retrieve(recordId);
        return result;
      }
    } catch (error) {
      console.error('Get record error:', error);
      throw new Error(`Failed to retrieve record: ${error.message}`);
    }
  }

  private async describeObject(objectType: string): Promise<any> {
    try {
      // Check cache first
      if (this.objectsMetadata.has(objectType)) {
        return this.objectsMetadata.get(objectType);
      }
      
      // Get object metadata
      const metadata = await this.conn.sobject(objectType).describe();
      
      // Cache the result
      this.objectsMetadata.set(objectType, metadata);
      
      return metadata;
    } catch (error) {
      console.error('Describe object error:', error);
      throw new Error(`Failed to describe object: ${error.message}`);
    }
  }

  private async getGlobalObjects(): Promise<any> {
    try {
      const result = await this.conn.describeGlobal();
      return {
        encoding: result.encoding,
        maxBatchSize: result.maxBatchSize,
        sobjects: result.sobjects.map(obj => ({
          name: obj.name,
          label: obj.label,
          custom: obj.custom,
          createable: obj.createable,
          updateable: obj.updateable,
          deletable: obj.deletable,
          queryable: obj.queryable
        }))
      };
    } catch (error) {
      console.error('Get global objects error:', error);
      throw new Error(`Failed to get global objects: ${error.message}`);
    }
  }
}
