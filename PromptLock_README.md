# PromptLock

A powerful service for analyzing and protecting prompts in AI applications. PromptLock helps prevent prompt injection attacks and ensures safe interaction with AI models.

## Features

- 🔒 **Prompt Analysis**: Detect and prevent prompt injection attacks
- 🎯 **Industry-Specific Detection**: Custom detection patterns for different industries
- 📊 **Analytics Dashboard**: Track and analyze prompt security metrics
- 🔍 **Pattern Detection**: Built-in detection patterns for common attack vectors
- 🤖 **Multi-Model Support**: Works with OpenAI, Anthropic, and other AI providers

## Installation

```bash
npm install promptlock
```

## Quick Start

```typescript
import { PromptLockClient } from 'promptlock';

// Initialize client
const client = new PromptLockClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.promptlock.dev',
  debug: true
});

// Analyze a prompt
const response = await client.analyzePrompt({
  text: 'Your prompt here',
  model: 'gpt-4',
  provider: 'openai',
  industry: 'technology'
});

// Check if prompt is safe
if (!response.detection.isMalicious) {
  // Proceed with your AI call
  console.log('Prompt is safe!');
} else {
  console.log('Warning: Potentially malicious prompt detected');
  console.log('Details:', response.detection.details);
}
```

## Detection Patterns

PromptLock includes built-in detection patterns for common attack vectors:

- System prompt leak attempts
- Role confusion attacks
- Data extraction attempts
- Command injection attempts
- Context manipulation

## API Reference

### `analyzePrompt`

Analyzes a prompt for potential injection attacks.

```typescript
interface PromptRequest {
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

interface PromptResponse {
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
```

### `getPatterns`

Get available detection patterns for a specific industry.

```typescript
const patterns = await client.getPatterns('technology');
```

### `getAnalytics`

Get analytics for your account.

```typescript
const analytics = await client.getAnalytics({
  industry: 'technology',
  startDate: '2024-01-01',
  endDate: '2024-03-20'
});
```

## Development

### Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)
- TypeScript (v5.0 or higher)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/kvdoherty1031/PromptLock.git
cd PromptLock
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```env
PROMPTLOCK_API_KEY=your-api-key
PROMPTLOCK_API_URL=http://localhost:3000
```

4. Run the demo:
```bash
npm run demo
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- Documentation: [docs.promptlock.dev](https://docs.promptlock.dev)
- Issues: [GitHub Issues](https://github.com/kvdoherty1031/PromptLock/issues)
- Email: support@promptlock.dev

## Security

If you discover any security-related issues, please email security@promptlock.dev instead of using the issue tracker. 