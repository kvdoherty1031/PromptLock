import axios, { AxiosInstance } from 'axios';
import { z } from 'zod';
import { EventEmitter } from 'events';

// Types
export interface PromptLockConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  debug?: boolean;
}

export interface PromptRequest {
  text: string;
  model: string;
  provider: 'openai' | 'anthropic';
  industry?: string;
  options?: {
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
  };
}

export interface PromptResponse {
  text: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  detection: {
    isMalicious: boolean;
    confidence: number;
    attackType?: string;
    details: string[];
  };
}

// Validation schemas
const configSchema = z.object({
  apiKey: z.string(),
  baseUrl: z.string().url().optional(),
  timeout: z.number().optional(),
  debug: z.boolean().optional(),
});

const requestSchema = z.object({
  text: z.string(),
  model: z.string(),
  provider: z.enum(['openai', 'anthropic']),
  industry: z.string().optional(),
  options: z.object({
    maxTokens: z.number().optional(),
    temperature: z.number().optional(),
    topP: z.number().optional(),
    frequencyPenalty: z.number().optional(),
    presencePenalty: z.number().optional(),
  }).optional(),
});

/**
 * PromptLock Client SDK
 * 
 * A client for interacting with the PromptLock prompt injection defense service.
 * 
 * Example usage:
 * ```typescript
 * const client = new PromptLockClient({
 *   apiKey: 'your-api-key',
 *   baseUrl: 'https://api.promptlock.dev'
 * });
 * 
 * const response = await client.analyzePrompt({
 *   text: 'Your prompt here',
 *   model: 'gpt-4',
 *   provider: 'openai',
 *   industry: 'technology'
 * });
 * ```
 */
export class PromptLockClient extends EventEmitter {
  private api: AxiosInstance;
  private debug: boolean;

  constructor(config: PromptLockConfig) {
    super();
    
    // Validate config
    const validatedConfig = configSchema.parse(config);
    
    // Initialize API client
    this.api = axios.create({
      baseURL: validatedConfig.baseUrl || 'https://api.promptlock.dev',
      timeout: validatedConfig.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${validatedConfig.apiKey}`,
      },
    });

    this.debug = validatedConfig.debug || false;

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      response => response,
      error => {
        if (error.response) {
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
   * Analyze a prompt for potential injection attacks
   */
  async analyzePrompt(request: PromptRequest): Promise<PromptResponse> {
    this.debug && console.log('Analyzing prompt:', request);

    // Validate request
    const validatedRequest = requestSchema.parse(request);

    try {
      const response = await this.api.post<PromptResponse>(
        '/v1/analyze',
        validatedRequest
      );

      return response.data;
    } catch (error) {
      this.debug && console.error('Analysis failed:', error);
      throw error;
    }
  }

  /**
   * Get detection patterns for a specific industry
   */
  async getPatterns(industry?: string): Promise<Array<{
    id: string;
    name: string;
    severity: 'low' | 'medium' | 'high';
    industry?: string[];
  }>> {
    try {
      const response = await this.api.get('/v1/patterns', {
        params: { industry }
      });

      return response.data;
    } catch (error) {
      this.debug && console.error('Failed to get patterns:', error);
      throw error;
    }
  }

  /**
   * Get analytics for your account
   */
  async getAnalytics(options: {
    startDate?: string;
    endDate?: string;
    industry?: string;
  } = {}): Promise<{
    totalRequests: number;
    maliciousRequests: number;
    averageConfidence: number;
    attackTypes: Record<string, number>;
  }> {
    try {
      const response = await this.api.get('/v1/analytics', {
        params: options
      });

      return response.data;
    } catch (error) {
      this.debug && console.error('Failed to get analytics:', error);
      throw error;
    }
  }
} 