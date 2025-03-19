import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const configSchema = z.object({
  // Server Configuration
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Database Configuration
  POSTGRES_URL: z.string(),
  REDIS_URL: z.string(),
  
  // API Keys
  OPENAI_API_KEY: z.string(),
  ANTHROPIC_API_KEY: z.string(),
  HUGGINGFACE_API_KEY: z.string(),
  
  // Security
  JWT_SECRET: z.string(),
  API_KEY_HEADER: z.string().default('x-api-key'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW: z.string().default('15m'),
  RATE_LIMIT_MAX: z.string().default('100'),
  
  // Detection Settings
  DETECTION_THRESHOLD: z.string().default('0.8'),
  MAX_TOKENS: z.string().default('4000'),
  
  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

const config = configSchema.parse(process.env);

export default config; 