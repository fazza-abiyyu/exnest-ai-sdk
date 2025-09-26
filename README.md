# Exnest AI SDK

[![npm version](https://img.shields.io/npm/v/@exnest-dev/ai)](https://www.npmjs.com/package/@exnest-dev/ai)
[![npm downloads](https://img.shields.io/npm/dm/@exnest-dev/ai)](https://www.npmjs.com/package/@exnest-dev/ai)
[![License](https://img.shields.io/npm/l/@exnest-dev/ai)](LICENSE)

The official Node.js SDK for Exnest AI - A unified API for multiple AI models including OpenAI, Google Gemini, Anthropic Claude, and more.

## Features

- **Unified API**: Access multiple AI providers through a single API
- **Full TypeScript Support**: Complete TypeScript definitions included
- **Flexible Authentication**: Support for both API key in request body and Authorization header
- **Built-in Retry Logic**: Automatic retry mechanism with exponential backoff
- **Comprehensive Error Handling**: Standardized error responses and handling
- **Streaming Support**: Real-time response streaming capabilities
- **Model Management**: List and retrieve information about available models
- **Configuration Options**: Customizable timeout, retries, and other options
- **n8n Compatible**: Works seamlessly with n8n and other tools using Bearer token authentication
- **Universal Connector**: Works with both Exnest API keys and official provider API keys

## Installation

```bash
npm install @exnest-dev/ai
```

## Quick Start

### Using the Advanced Client (Recommended)

```javascript
import { ExnestAI } from '@exnest-dev/ai';

const exnest = new ExnestAI({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.exnest.app/v1', // Optional, uses default if not provided
  timeout: 30000, // Optional
  retries: 3, // Optional
  retryDelay: 1000, // Optional
  debug: true // Optional
});

// Simple chat completion
const response = await exnest.chat('gpt-4.1-mini', [
  { role: 'user', content: 'Hello, how are you?' }
]);

console.log(response.data.choices[0].message.content);
```

### Using the Simple Wrapper

```javascript
import { ExnestWrapper } from '@exnest-dev/ai';

const exnest = new ExnestWrapper('your-api-key');

// Simple response
const response = await exnest.response('claude-3-haiku', 'What is TypeScript?');
console.log(response.data.choices[0].message.content);
```

## Universal Connector

Exnest supports both Exnest API keys (prefixed with `ex-sk`) and official provider API keys through the Universal Connector feature. This allows you to:

1. Use your existing API keys from providers like OpenAI, Anthropic, etc.
2. Still benefit from Exnest's unified API interface
3. Optionally use Exnest's billing and management features when using Exnest API keys

### Using Exnest API Keys (with billing)

```javascript
const exnest = new ExnestAI({
  apiKey: 'ex-sk-your-exnest-api-key'
});

const response = await exnest.chat('gpt-4.1-mini', [
  { role: 'user', content: 'Hello!' }
]);
```

### Using Official Provider API Keys (without billing)

```javascript
const exnest = new ExnestAI({
  apiKey: 'sk-your-openai-api-key'
});

const response = await exnest.chat('gpt-4.1-mini', [
  { role: 'user', content: 'Hello!' }
]);
```

## API Reference

### ExnestAI Client Options

```typescript
interface ExnestClientOptions {
  apiKey: string;           // Required: Your ExnestAI API key
  baseUrl?: string;         // Optional: API base URL (default: https://api.exnest.app/v1)
  timeout?: number;         // Optional: Request timeout in ms (default: 30000)
  retries?: number;         // Optional: Number of retries (default: 3)
  retryDelay?: number;      // Optional: Delay between retries in ms (default: 1000)
  debug?: boolean;          // Optional: Enable debug logging (default: false)
}
```

### Chat Completion

```typescript
const response = await exnest.chat(
  'gpt-4.1-mini', // Model identifier
  [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Explain async/await in JavaScript' }
  ],
  {
    temperature: 0.7,    // Optional
    max_tokens: 500,      // Optional
  }
);
```

### Streaming Responses

```typescript
// Streaming chat completion
for await (const chunk of exnest.stream('gpt-4.1-mini', [
  { role: 'user', content: 'Write a story about a robot learning to love' }
])) {
  process.stdout.write(chunk.choices[0].delta.content || '');
}
```

### Simple Response

```typescript
const response = await exnest.responses(
  'claude-3-haiku', // Model identifier
  'What is TypeScript?',      // User input
  200                         // Optional max tokens
);
```

## Model Management

### List All Available Models

```typescript
const models = await exnest.getModels();
console.log(models.data);
```

### Get Specific Model Information

```typescript
const model = await exnest.getModel('gpt-4.1-mini');
console.log(model.data);
```

## Authentication

The SDK supports two authentication methods:

### Method 1: API Key in Request Body (Default)
The API key is automatically included in the request body.

### Method 2: Authorization Bearer Header (n8n Compatible)
To use Bearer token authentication, pass the API key in the client options:

```javascript
const exnest = new ExnestAI({
  apiKey: 'your-api-key'
});
```

This makes the SDK fully compatible with n8n and other tools that use standard Bearer token authentication.

## Supported Models

Currently available models:
- **OpenAI**: `gpt-4.1-mini`, `gpt-3.5-turbo`
- **Anthropic**: `claude-3-haiku`, `claude-3-sonnet`, `claude-3-opus`
- **Google**: `gemini-2.5-flash`, `gemini-1.5-pro`
- **Moonshot**: `moonshot-v1-8k`, `moonshot-v1-32k`, `moonshot-v1-128k`

More models will be added in the future.

## Error Handling

```javascript
try {
  const response = await exnest.chat(model, messages);
  
  if (!response.success) {
    console.error('API Error:', response.error);
  }
} catch (error) {
  console.error('Network Error:', error);
}
```

## Configuration Management

```javascript
// Get current configuration
const config = exnest.getConfig();
console.log(config);

// Update configuration
exnest.updateConfig({
  timeout: 60000,
  retries: 5,
  debug: true
});
```

## Health Check

```javascript
// Test API connection
const testResult = await exnest.testConnection();
if (testResult.success) {
  console.log('Connection successful');
}

// Health check
const health = await exnest.healthCheck();
console.log('Service status:', health.status);
```

## Integration with Express.js

```javascript
import { ExnestAI } from '@exnest-dev/ai';
import express from 'express';

const app = express();
app.use(express.json());

app.post('/chat', async (req, res) => {
  // API key can come from request body or Authorization header
  const apiKey = req.body.api_key || 
    (req.headers.authorization?.startsWith('Bearer ') ? 
     req.headers.authorization.substring(7) : null);
  
  const exnest = new ExnestAI({
    apiKey,
    debug: process.env.NODE_ENV === 'development'
  });
  
  try {
    const result = await exnest.chat(req.body.model, req.body.messages);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## TypeScript Support

The SDK includes full TypeScript definitions:

```typescript
import { ExnestAI, ExnestMessage, ExnestResponse } from '@exnest-dev/ai';

const messages: ExnestMessage[] = [
  { role: 'user', content: 'Hello!' }
];

const response: ExnestResponse = await exnest.chat('gpt-4.1-mini', messages);
```

## Environment Variables

You can set the base URL using environment variables:

```env
EXNEST_API_URL=https://api.exnest.app/v1
```

## License

This SDK is licensed under the MIT License. See [LICENSE](LICENSE) for more information.

## Support

For issues and feature requests, please [open an issue](https://github.com/fazza-abiyyu/exnest-ai-sdk/issues) on GitHub.