# Model Context Protocol (MCP) as a Service

A universal Model Context Protocol service that makes it easy to integrate various data sources with your LLM applications. Just a few lines of code to access structured context from any supported service.

## Features

- 🔌 Easy Integration: Simple client SDK that works with any JavaScript/TypeScript application
- 🔒 Secure: Built-in authentication and API key management
- 🚀 Extensible: Support for multiple services (Salesforce, GitHub, etc.)
- 📝 Type-Safe: Full TypeScript support with runtime validation
- 🔍 Context-Aware: Smart context generation for LLMs

## Quick Start

### Installation

```bash
npm install @odva/mcp-service
```

### Usage

```typescript
import { MCPClient } from '@odva/mcp-service';

// Initialize client
const client = new MCPClient({
  baseUrl: 'https://api.odva.dev',
  apiKey: 'your_api_key'
});

// Login
await client.login('user@example.com', 'password');

// Add a Salesforce connection
const sfConnection = await client.addConnection('salesforce', {
  clientId: 'your_client_id',
  clientSecret: 'your_client_secret',
  username: 'sf_username',
  password: 'sf_password'
});

// Get context for your LLM
const context = await client.getContext(['salesforce']);

// Use context with your favorite LLM
const completion = await openai.createCompletion({
  model: 'gpt-4',
  prompt: context + '\nAnalyze my Salesforce data.',
  // ... other options
});
```

## Supported Services

### Salesforce
- Query records with SOQL
- Get record details
- Access schema information
- View recent items

More services coming soon!

## Development

### Prerequisites

- Node.js 18+
- npm or yarn
- TypeScript 5.3+

### Setup

1. Clone the repository:
```bash
git clone https://github.com/odva/mcp-service.git
cd mcp-service
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```env
PORT=3000
JWT_SECRET=your-secret-key
API_KEY=your-dev-api-key
```

4. Start development server:
```bash
npm run dev
```

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

## API Documentation

### Authentication

All requests require:
1. API Key in `x-api-key` header
2. JWT token in `Authorization: Bearer <token>` header

Get a token by calling:
```typescript
await client.login(email, password);
// Token is automatically set in the client
```

### Connections

Add a connection:
```typescript
const connectionId = await client.addConnection('salesforce', {
  // Connection-specific credentials
});
```

List connections:
```typescript
const connections = await client.listConnections();
```

### Tools

List available tools:
```typescript
const tools = await client.listTools('salesforce');
```

Call a tool:
```typescript
const results = await client.callTool('salesforce', 'query_records', {
  soql: 'SELECT Id, Name FROM Account LIMIT 5'
});
```

### Context Generation

Get context for LLM:
```typescript
const context = await client.getContext(['salesforce'], {
  maxTokens: 1000,
  includeMetadata: true
});
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details

## Support

- Documentation: [docs.odva.dev](https://docs.odva.dev)
- Issues: [GitHub Issues](https://github.com/odva/mcp-service/issues)
- Email: support@odva.dev

# PromptLock Demo

This demo showcases the functionality of PromptLock, a service for analyzing and protecting prompts in AI applications.

## Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)
- A PromptLock API key

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the `PROMPTLOCK_API_KEY` with your actual API key
   - Update the `PROMPTLOCK_API_URL` if you're using a different endpoint

## Running the Demo

To run the demo:

```bash
npm run demo
```

The demo will:
1. Initialize the PromptLock client
2. Test a safe prompt analysis
3. Test a malicious prompt analysis
4. Fetch available detection patterns
5. Get analytics data

## Demo Output

The demo will show:
- Safe prompt analysis results
- Malicious prompt detection
- Available detection patterns
- Analytics data for the last 7 days

## Next Steps

1. Review the code in `src/client/PromptLockClient.ts`
2. Check out the detection patterns in `src/detection/engine.ts`
3. Try adding your own detection patterns
4. Integrate PromptLock into your application

## License

MIT 