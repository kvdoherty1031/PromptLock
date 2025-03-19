import { z } from 'zod';
import { HfInference } from '@huggingface/inference';
import config from '../config/config';

// Types
export interface DetectionResult {
  isMalicious: boolean;
  confidence: number;
  attackType?: string;
  details: string[];
}

export interface DetectionPattern {
  id: string;
  name: string;
  pattern: RegExp;
  severity: 'low' | 'medium' | 'high';
  industry?: string[];
}

// Validation schemas
const promptSchema = z.object({
  text: z.string(),
  model: z.string(),
  provider: z.enum(['openai', 'anthropic']),
  industry: z.string().optional(),
});

// Core detection patterns
const patterns: DetectionPattern[] = [
  {
    id: 'system_prompt_leak',
    name: 'System Prompt Leak Attempt',
    pattern: /(?:system|assistant|user|human|prompt|instruction).*?(?:prompt|instruction|system|assistant|user|human)/i,
    severity: 'high',
  },
  {
    id: 'role_confusion',
    name: 'Role Confusion Attack',
    pattern: /(?:you are|act as|pretend to be|ignore previous|forget about|disregard).*?(?:assistant|user|human|system)/i,
    severity: 'high',
  },
  {
    id: 'data_extraction',
    name: 'Data Extraction Attempt',
    pattern: /(?:show|reveal|display|output|print|return).*?(?:system|prompt|instruction|training|knowledge)/i,
    severity: 'high',
  },
  {
    id: 'command_injection',
    name: 'Command Injection Attempt',
    pattern: /(?:execute|run|system|command|shell|terminal).*?(?:command|system|shell|terminal)/i,
    severity: 'high',
  },
  {
    id: 'context_manipulation',
    name: 'Context Manipulation',
    pattern: /(?:ignore|forget|disregard|remove|delete).*?(?:previous|context|history|conversation)/i,
    severity: 'medium',
  },
];

export class DetectionEngine {
  private hf: HfInference;
  private patterns: DetectionPattern[];

  constructor() {
    this.hf = new HfInference(config.HUGGINGFACE_API_KEY);
    this.patterns = patterns;
  }

  /**
   * Analyze a prompt for potential injection attacks
   */
  async analyzePrompt(prompt: z.infer<typeof promptSchema>): Promise<DetectionResult> {
    const results: DetectionResult[] = [];

    // 1. Pattern-based detection
    for (const pattern of this.patterns) {
      if (pattern.industry && prompt.industry && !pattern.industry.includes(prompt.industry)) {
        continue;
      }

      const matches = prompt.text.match(pattern.pattern);
      if (matches) {
        results.push({
          isMalicious: true,
          confidence: 0.9,
          attackType: pattern.name,
          details: [`Matched pattern: ${pattern.name}`],
        });
      }
    }

    // 2. Semantic analysis using Hugging Face
    try {
      const semanticResult = await this.semanticAnalysis(prompt.text);
      if (semanticResult.isMalicious) {
        results.push(semanticResult);
      }
    } catch (error) {
      console.error('Semantic analysis failed:', error);
    }

    // 3. Combine results
    if (results.length === 0) {
      return {
        isMalicious: false,
        confidence: 0,
        details: ['No malicious patterns detected'],
      };
    }

    // Return the highest confidence result
    return results.reduce((prev, current) => 
      current.confidence > prev.confidence ? current : prev
    );
  }

  /**
   * Perform semantic analysis using Hugging Face models
   */
  private async semanticAnalysis(text: string): Promise<DetectionResult> {
    try {
      const result = await this.hf.textClassification({
        model: 'microsoft/deberta-v3-base',
        inputs: text,
        parameters: {
          top_k: 1,
        },
      });

      // This is a simplified example - you would need to train a specific model
      // for prompt injection detection
      return {
        isMalicious: result[0].label === 'malicious',
        confidence: result[0].score,
        attackType: 'Semantic Analysis',
        details: ['Semantic analysis detected potential malicious intent'],
      };
    } catch (error) {
      console.error('Semantic analysis failed:', error);
      return {
        isMalicious: false,
        confidence: 0,
        details: ['Semantic analysis failed'],
      };
    }
  }

  /**
   * Add a new detection pattern
   */
  addPattern(pattern: DetectionPattern): void {
    this.patterns.push(pattern);
  }

  /**
   * Remove a detection pattern
   */
  removePattern(patternId: string): void {
    this.patterns = this.patterns.filter(p => p.id !== patternId);
  }
} 