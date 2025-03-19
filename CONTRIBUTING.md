# Contributing to MCP Service

This guide will help you set up the MCP Service development environment.

## Development Environment Setup

### Prerequisites

- Node.js 18+ (recommended: use [nvm](https://github.com/nvm-sh/nvm) to manage Node versions)
- npm or yarn
- Git
- A code editor (recommended: VS Code)

### First-Time Setup

1. **Clone the Repository**
```bash
git clone https://github.com/odva/mcp-service.git
cd mcp-service
```

2. **Install Dependencies**
```bash
npm install
```

3. **Set Up Environment Variables**
```bash
# Copy the example environment file
cp .env.example .env

# Open .env and update the values:
# - Generate a secure JWT_SECRET (you can use: openssl rand -base64 32)
# - Set your API_KEY
# - Update other values as needed
```

4. **Start Development Server**
```bash
npm run dev
```

The server will start at `http://localhost:3000` by default.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch
```

### Code Style and Linting

We use ESLint and Prettier to maintain code quality:

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint -- --fix

# Format code
npm run format
```

## Project Structure

```
src/
├── client/           # Client SDK
│   └── MCPClient.ts  # Main client class
├── server/           # Server implementation
│   ├── adapters/     # Service adapters (Salesforce, etc.)
│   ├── middleware/   # Express middleware
│   ├── routes/       # API routes
│   └── index.ts      # Server entry point
└── types/           # TypeScript type definitions
```

## Key Features and Where to Find Them

1. **Client SDK** (`src/client/MCPClient.ts`)
   - Main interface for developers
   - Authentication handling
   - Connection management
   - Tool execution
   - Context generation

2. **Service Adapters** (`src/server/adapters/`)
   - Salesforce integration (`salesforce.ts`)
   - Add new services here

3. **API Routes** (`src/server/routes/`)
   - Authentication (`auth.ts`)
   - Connections (`connections.ts`)
   - Tools (`tools.ts`)
   - Context (`context.ts`)

## Adding a New Service Adapter

1. Create a new file in `src/server/adapters/`
2. Implement the required interfaces:
   - `listTools()`
   - `listResources()`
   - `readResource()`
   - `callTool()`
3. Add the adapter to the factory in `tools.ts` and `context.ts`

## Common Development Tasks

### Adding a New Tool to Salesforce Adapter

1. Open `src/server/adapters/salesforce.ts`
2. Add tool definition to `SALESFORCE_TOOLS`
3. Implement tool logic in `callTool()`

### Modifying Authentication

1. Update middleware in `src/server/middleware/authenticate.ts`
2. Update auth routes in `src/server/routes/auth.ts`

### Adding API Endpoints

1. Create route handler in appropriate file under `src/server/routes/`
2. Add route to `src/server/index.ts`

## Deployment

For production deployment:

1. Build the project:
```bash
npm run build
```

2. Set production environment variables:
```bash
NODE_ENV=production
PORT=3000
JWT_SECRET=<secure-secret>
API_KEY=<your-api-key>
```

3. Start the server:
```bash
npm start
```

## Getting Help

- Check existing issues on GitHub
- Create a new issue for bugs or feature requests
- Contact the team at support@odva.dev 