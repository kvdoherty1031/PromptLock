import axios from 'axios';

class MCPClient {
  private baseUrl: string;
  private apiKey: string;
  private token: string | null = null;
  private connectionIds: Map<string, string> = new Map(); // Service type to connection ID

  constructor(config: {
    baseUrl: string;
    apiKey: string;
    token?: string;
  }) {
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
    this.token = config.token || null;
  }

  // Authentication methods
  async login(email: string, password: string): Promise<string> {
    const response = await axios.post(`${this.baseUrl}/api/login`, {
      email,
      password
    });
    
    this.token = response.data.token;
    return this.token;
  }

  async register(email: string, password: string): Promise<void> {
    await axios.post(`${this.baseUrl}/api/register`, {
      email,
      password
    });
  }

  // Connection management
  async addConnection(type: string, credentials: any): Promise<string> {
    this.ensureAuthenticated();
    
    const response = await axios.post(
      `${this.baseUrl}/api/connections`,
      { type, credentials },
      { headers: this.getAuthHeaders() }
    );
    
    const connectionId = response.data.connectionId;
    this.connectionIds.set(type, connectionId);
    
    return connectionId;
  }

  async listConnections(): Promise<any[]> {
    this.ensureAuthenticated();
    
    const response = await axios.get(
      `${this.baseUrl}/api/connections`,
      { headers: this.getAuthHeaders() }
    );
    
    return response.data;
  }

  // MCP Protocol methods
  async discover(connectionType: string): Promise<any> {
    const connectionId = await this.getConnectionId(connectionType);
    
    return this.sendMcpMessage(connectionId, {
      type: 'discover',
      id: this.generateMessageId()
    });
  }

  async listTools(connectionType: string): Promise<any> {
    const connectionId = await this.getConnectionId(connectionType);
    
    return this.sendMcpMessage(connectionId, {
      type: 'list_tools',
      id: this.generateMessageId()
    });
  }

  async callTool(connectionType: string, toolName: string, parameters: any): Promise<any> {
    const connectionId = await this.getConnectionId(connectionType);
    
    return this.sendMcpMessage(connectionId, {
      type: 'call_tool',
      id: this.generateMessageId(),
      tool: toolName,
      parameters
    });
  }

  async listResources(connectionType: string): Promise<any> {
    const connectionId = await this.getConnectionId(connectionType);
    
    return this.sendMcpMessage(connectionId, {
      type: 'list_resources',
      id: this.generateMessageId()
    });
  }

  async readResource(connectionType: string, resourceUrl: string): Promise<any> {
    const connectionId = await this.getConnectionId(connectionType);
    
    return this.sendMcpMessage(connectionId, {
      type: 'read_resource',
      id: this.generateMessageId(),
      resource: resourceUrl
    });
  }

  // Generate context for LLM
  async getContext(connectionTypes: string[]): Promise<string> {
    let context = '';
    
    for (const connectionType of connectionTypes) {
      try {
        // Get schema information
        const resources = await this.listResources(connectionType);
        
        for (const resource of resources.resources) {
          const resourceContent = await this.readResource(connectionType, resource.url);
          context += `\n--- ${connectionType.toUpperCase()} ${resource.name} ---\n`;
          context += resourceContent.content;
          context += '\n\n';
        }
      } catch (error) {
        console.error(`Error getting context for ${connectionType}:`, error);
      }
    }
    
    return context;
  }

  // Helper methods
  private ensureAuthenticated(): void {
    if (!this.token) {
      throw new Error('Authentication required. Call login() first.');
    }
  }

  private getAuthHeaders(): any {
    return {
      'Authorization': `Bearer ${this.token}`,
      'x-api-key': this.apiKey
    };
  }

  private async getConnectionId(connectionType: string): Promise<string> {
    // If we have a cached connection ID, use it
    if (this.connectionIds.has(connectionType)) {
      return this.connectionIds.get(connectionType)!;
    }
    
    // Otherwise, get all connections and find the matching one
    const connections = await this.listConnections();
    const connection = connections.find(conn => conn.type === connectionType);
    
    if (!connection) {
      throw new Error(`No connection found for type: ${connectionType}`);
    }
    
    this.connectionIds.set(connectionType, connection.id);
    return connection.id;
  }

  private async sendMcpMessage(connectionId: string, message: any): Promise<any> {
    this.ensureAuthenticated();
    
    const response = await axios.post(
      `${this.baseUrl}/api/mcp/${connectionId}`,
      message,
      { headers: this.getAuthHeaders() }
    );
    
    return response.data;
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Example usage
async function example() {
  // Initialize client
  const client = new MCPClient({
    baseUrl: 'http://localhost:3000',
    apiKey: 'dev_api_key_123'
  });
  
  // Login
  await client.login('user@example.com', 'password123');
  
  // Add Salesforce connection
  await client.addConnection('salesforce', {
    clientId: 'your_salesforce_client_id',
    clientSecret: 'your_salesforce_client_secret',
    username: 'your_salesforce_username',
    password: 'your_salesforce_password'
  });
  
  // Get available tools
  const toolsResponse = await client.listTools('salesforce');
  console.log('Available Salesforce tools:', toolsResponse.tools);
  
  // Call a tool
  const queryResults = await client.callTool(
    'salesforce',
    'query_records',
    { soql: 'SELECT Id, Name FROM Account LIMIT 5' }
  );
  console.log('Query results:', queryResults.result);
  
  // Get context for an LLM
  const llmContext = await client.getContext(['salesforce']);
  console.log('LLM Context:', llmContext);
  
  // Use with any LLM
  // This is where you'd call your LLM provider with the context
  const llmResponse = await callExternalLLM(
    'Tell me about my Salesforce accounts',
    llmContext
  );
  console.log('LLM Response:', llmResponse);
}

// Mock function for LLM call
async function callExternalLLM(prompt: string, context: string): Promise<string> {
  // Here you would call your LLM provider API (OpenAI, Anthropic, etc.)
  console.log('Calling LLM with context length:', context.length);
  return 'This is a mock LLM response';
}

// Run the example
example().catch(console.error);
