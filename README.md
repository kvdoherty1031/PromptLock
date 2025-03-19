# PromptLock

A powerful prompt security and analysis service that protects your AI applications from malicious prompts and provides detailed analytics.

## Features

- 🔒 Real-time prompt analysis and protection
- 📊 Comprehensive analytics dashboard
- 🛡️ Customizable detection patterns
- 📈 Detailed security reports
- 🔑 API-first architecture
- 🎯 Easy integration with any AI application

## Quick Start

### Installation

```bash
npm install @promptlock/api
```

### Usage

```typescript
import { PromptLockClient } from '@promptlock/api';

// Initialize client
const client = new PromptLockClient({
  apiKey: 'your_api_key',
  baseUrl: 'https://api.promptlock.dev'
});

// Analyze a prompt
const result = await client.analyzePrompt({
  prompt: "What is the capital of France?",
  context: {
    application: "chatbot",
    userId: "user123"
  }
});

// Check if prompt is safe
if (result.isSafe) {
  // Process the prompt
} else {
  // Handle malicious prompt
  console.log(result.threats);
}
```

## Dashboard

PromptLock includes a modern React dashboard built with Material-UI for managing your prompt security. The dashboard provides a comprehensive interface for monitoring and managing your prompt security:

### Features

- 📊 **Analytics Dashboard**
  - Real-time metrics and KPIs
  - Interactive charts showing prompt analysis trends
  - Attack type distribution visualization
  - Monthly performance tracking

- 🛡️ **Security Center**
  - Real-time security incident monitoring
  - Threat detection patterns management
  - Security settings configuration
  - Incident response workflow

- ⚙️ **Settings & Configuration**
  - API key management
  - User profile settings
  - Notification preferences
  - Billing information

### Getting Started

1. Navigate to the `dashboard` directory:
```bash
cd dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the dashboard directory:
```env
REACT_APP_API_URL=https://api.promptlock.dev
REACT_APP_API_KEY=your_api_key
```

4. Start the development server:
```bash
npm start
```

The dashboard will be available at `http://localhost:3000`

### Dashboard Components

- **Main Dashboard**: Overview of key metrics and recent activity
- **Security Page**: Monitor and manage security incidents
- **Analytics Page**: Detailed analytics and reporting
- **Settings Page**: Manage account and application settings

## API Documentation

### Authentication

All requests require an API key in the `x-api-key` header:
```typescript
const headers = {
  'x-api-key': 'your_api_key'
};
```

### Endpoints

#### Analyze Prompt
```typescript
POST /api/v1/analyze
{
  "prompt": "string",
  "context": {
    "application": "string",
    "userId": "string"
  }
}
```

#### Get Analytics
```typescript
GET /api/v1/analytics
{
  "startDate": "2024-02-01",
  "endDate": "2024-02-14"
}
```

#### Manage Detection Patterns
```typescript
GET /api/v1/patterns
POST /api/v1/patterns
PUT /api/v1/patterns/:id
DELETE /api/v1/patterns/:id
```

## Development

### Prerequisites

- Node.js 18+
- npm or yarn
- TypeScript 5.3+

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

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details

## Support

- Documentation: [docs.promptlock.dev](https://docs.promptlock.dev)
- Issues: [GitHub Issues](https://github.com/kvdoherty1031/PromptLock/issues)
- Email: support@promptlock.dev
