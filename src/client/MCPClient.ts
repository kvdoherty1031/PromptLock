import axios, { AxiosInstance } from 'axios';
import { z } from 'zod';
import { EventEmitter } from 'events';

// Type definitions
export interface MCPClientConfig {
  mode: 'local' | 'remote';
  baseUrl?: string;
  apiKey?: string;
  token?: string;
  autoReconnect?: boolean;
  debug?: boolean;
}

export interface ConnectionCredentials {
  [key: string]: any;
}

export interface MCPResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Event types
export type MCPEventType = 
  | 'connect'
  | 'disconnect'
  | 'error'
  | 'reconnect'
  | 'tool:start'
  | 'tool:end'
  | 'context:start'
  | 'context:end';

// Validation schemas
const connectionSchema = z.object({
  type: z.string(),
  credentials: z.record(z.any()),
  mode: z.enum(['local', 'remote']).optional()
});

/**
 * MCPClient - Universal Model Context Protocol Client
 * 
 * Supports both local and remote modes:
 * 
 * Local mode (recommended for development):
 * ```typescript
 * const client = new MCPClient({
 *   mode: 'local'
 * });
 * ```
 * 
 * Remote mode (for production):
 * ```typescript
 * const client = new MCPClient({
 *   mode: 'remote',
 *   baseUrl: 'https://api.odva.dev',
 *   apiKey: 'your_api_key'
 * });
 * ```
 */
export class MCPClient extends EventEmitter {
  private api: AxiosInstance | null = null;
  private token: string | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 3;
  private debugMode: boolean;

  constructor(private config: MCPClientConfig) {
    super();
    this.debugMode = config.debug || false;

    if (config.mode === 'remote') {
      if (!config.baseUrl) {
        throw new Error('baseUrl is required in remote mode');
      }
      if (!config.apiKey) {
        throw new Error('apiKey is required in remote mode');
      }
      this.initializeRemoteClient();
    }

    // Set token if provided
    if (config.token) {
      this.setToken(config.token);
    }
  }

  /**
   * Initialize remote client with interceptors and auto-reconnect
   */
  private initializeRemoteClient(): void {
    this.api = axios.create({
      baseURL: this.config.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey
      }
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      response => response,
      async error => {
        if (error.response) {
          // Handle authentication errors
          if (error.response.status === 401 && this.config.autoReconnect) {
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
              this.reconnectAttempts++;
              this.emit('reconnect', { attempt: this.reconnectAttempts });
              // Try to refresh token or reconnect
              try {
                await this.reconnect();
                // Retry the original request
                return this.api?.request(error.config);
              } catch (reconnectError) {
                this.emit('error', { type: 'reconnect_failed', error: reconnectError });
                throw reconnectError;
              }
            }
          }
          throw new Error(error.response.data.error || 'An error occurred');
        } else if (error.request) {
          throw new Error('No response from server');
        } else {
          throw new Error('Failed to make request');
        }
      }
    );
  }

  /**
   * Debug log helper
   */
  private debug(...args: any[]): void {
    if (this.debugMode) {
      console.log('[MCP Debug]', ...args);
    }
  }

  /**
   * Set the authentication token
   */
  private setToken(token: string): void {
    this.token = token;
    if (this.api) {
      this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }

  /**
   * Attempt to reconnect to the server
   */
  private async reconnect(): Promise<void> {
    if (!this.token) {
      throw new Error('No token available for reconnection');
    }
    // Implementation depends on your token refresh mechanism
    this.debug('Attempting to reconnect...');
    // Add your reconnection logic here
  }

  /**
   * Login to the MCP service
   */
  async login(email: string, password: string): Promise<void> {
    if (this.config.mode === 'local') {
      this.debug('Login not required in local mode');
      return;
    }

    const response = await this.api?.post<MCPResponse<{ token: string }>>('/auth/login', {
      email,
      password
    });

    if (response?.data.success && response.data.data?.token) {
      this.setToken(response.data.data.token);
      this.emit('connect');
    } else {
      throw new Error(response?.data.error || 'Login failed');
    }
  }

  /**
   * Register a new user account
   */
  async register(email: string, password: string): Promise<void> {
    if (this.config.mode === 'local') {
      this.debug('Registration not required in local mode');
      return;
    }

    const response = await this.api?.post<MCPResponse>('/auth/register', {
      email,
      password
    });

    if (!response?.data.success) {
      throw new Error(response?.data.error || 'Registration failed');
    }
  }

  /**
   * Add a new connection to a service
   */
  async addConnection(type: string, credentials: ConnectionCredentials): Promise<string> {
    this.debug('Adding connection:', type);

    // Validate input
    const validatedData = connectionSchema.parse({ 
      type, 
      credentials,
      mode: this.config.mode 
    });

    if (this.config.mode === 'local') {
      // In local mode, we just validate credentials and return a local ID
      return `local_${type}_${Date.now()}`;
    }

    const response = await this.api?.post<MCPResponse<{ connectionId: string }>>(
      '/connections',
      validatedData
    );

    if (response?.data.success && response.data.data?.connectionId) {
      return response.data.data.connectionId;
    }
    throw new Error(response?.data.error || 'Failed to add connection');
  }

  /**
   * List all connections
   */
  async listConnections(): Promise<Array<{ id: string; type: string }>> {
    if (this.config.mode === 'local') {
      // In local mode, return empty list as connections are handled differently
      return [];
    }

    const response = await this.api?.get<MCPResponse<Array<{ id: string; type: string }>>>(
      '/connections'
    );

    if (response?.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response?.data.error || 'Failed to list connections');
  }

  /**
   * Get context from specified services for LLMs
   * @param services Array of service types to get context from
   * @param options Optional configuration for context generation
   */
  async getContext(
    services: string[],
    options: {
      maxTokens?: number;
      includeMetadata?: boolean;
      format?: 'text' | 'json' | 'markdown';
    } = {}
  ): Promise<string> {
    this.emit('context:start', { services, options });
    this.debug('Getting context for services:', services);

    try {
      if (this.config.mode === 'local') {
        // In local mode, we gather context directly
        let context = '';
        for (const service of services) {
          const tools = await this.listTools(service);
          context += `\n=== ${service.toUpperCase()} ===\n`;
          context += `Available tools: ${tools.map(t => t.name).join(', ')}\n`;
        }
        return context;
      }

      const response = await this.api?.post<MCPResponse<{ context: string }>>(
        '/context',
        { services, options }
      );

      if (response?.data.success && response.data.data?.context) {
        return response.data.data.context;
      }
      throw new Error(response?.data.error || 'Failed to get context');
    } finally {
      this.emit('context:end');
    }
  }

  /**
   * Call a specific tool on a connection
   */
  async callTool(connectionType: string, toolName: string, parameters: any): Promise<any> {
    this.emit('tool:start', { connectionType, toolName, parameters });
    this.debug('Calling tool:', toolName, 'on', connectionType);

    try {
      if (this.config.mode === 'local') {
        // In local mode, we execute tools directly
        // Implementation would depend on local tool execution logic
        throw new Error('Tool execution not implemented in local mode');
      }

      const response = await this.api?.post<MCPResponse>(
        `/tools/${connectionType}/${toolName}`,
        parameters
      );

      if (response?.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response?.data.error || 'Tool call failed');
    } finally {
      this.emit('tool:end');
    }
  }

  /**
   * List available tools for a connection type
   */
  async listTools(connectionType: string): Promise<Array<{
    name: string;
    description: string;
    inputSchema: any;
  }>> {
    this.debug('Listing tools for:', connectionType);

    if (this.config.mode === 'local') {
      // In local mode, return built-in tools
      return [
        {
          name: 'query_records',
          description: 'Query records from the service',
          inputSchema: { type: 'object' }
        }
      ];
    }

    const response = await this.api?.get<MCPResponse<Array<{
      name: string;
      description: string;
      inputSchema: any;
    }>>>(`/tools/${connectionType}`);

    if (response?.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response?.data.error || 'Failed to list tools');
  }

  /**
   * Disconnect and cleanup
   */
  disconnect(): void {
    this.token = null;
    this.api = null;
    this.emit('disconnect');
  }
} 