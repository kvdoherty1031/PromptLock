# Quick Start Guide

Hey! 👋 Here's how to get started with our MCP Service project.

## What is This?

This is our Model Context Protocol (MCP) as a Service project. It allows developers to easily integrate various data sources (like Salesforce) with their LLM applications using just a few lines of code.

Key features:
- 🔌 Simple client SDK
- 🔒 Built-in security
- 🚀 Easy to extend
- 📝 TypeScript support
- 🔍 Smart context generation

## Quick Demo (5 minutes)

1. **Setup**
```bash
# Clone the repo
git clone https://github.com/odva/mcp-service.git
cd mcp-service

# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env
```

2. **Start the Server**
```bash
npm run dev
```

3. **Try the Demo Client**
```typescript
import { MCPClient } from './src/client/MCPClient';

async function demo() {
  // Create client
  const client = new MCPClient({
    baseUrl: 'http://localhost:3000',
    apiKey: 'your-dev-api-key' // Use the API_KEY from your .env
  });

  // Register and login
  await client.register('demo@example.com', 'password123');
  await client.login('demo@example.com', 'password123');

  // Add Salesforce connection
  await client.addConnection('salesforce', {
    clientId: 'your-sf-client-id',
    clientSecret: 'your-sf-client-secret',
    username: 'your-sf-username',
    password: 'your-sf-password'
  });

  // Get context
  const context = await client.getContext(['salesforce']);
  console.log('Context:', context);
}

demo().catch(console.error);
```

## Project Overview

### Key Files

- `src/client/MCPClient.ts` - The main client SDK
- `src/server/adapters/salesforce.ts` - Salesforce integration
- `src/server/routes/` - API endpoints
- `CONTRIBUTING.md` - Detailed development guide

### Current Status

- ✅ Basic architecture implemented
- ✅ Client SDK working
- ✅ Salesforce adapter implemented
- ✅ Authentication & security
- 🚧 Need to add more service adapters
- 🚧 Need to improve error handling
- 🚧 Need to add tests

## Next Steps

1. Review the code structure in `CONTRIBUTING.md`
2. Check our current issues on GitHub
3. Try adding a new service adapter (GitHub would be a good start)

## Development Workflow

1. Create a feature branch:
```bash
git checkout -b feature/your-feature
```

2. Make changes and commit:
```bash
git add .
git commit -m "Description of changes"
```

3. Push and create PR:
```bash
git push origin feature/your-feature
```

## Common Tasks

### Adding a New Service

1. Create adapter in `src/server/adapters/`
2. Implement required methods
3. Add to factories in `tools.ts` and `context.ts`

### Modifying the Client SDK

1. Update `src/client/MCPClient.ts`
2. Add new methods as needed
3. Update documentation

## Questions?

- Check `CONTRIBUTING.md` for detailed docs
- Review existing GitHub issues
- Email me anytime!

## Immediate TODOs

1. Review current implementation
2. Identify priority features
3. Plan next sprint
4. Set up regular sync meetings

Let me know if you need any clarification or want to discuss specific parts of the project! 