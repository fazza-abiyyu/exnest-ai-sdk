# ExnestAI Client Services

This directory contains the client services for interacting with the ExnestAI API. It provides two main implementations:

## Services Overview

### 1. Wrapper Service (`wrapper.services.ts`)
A simple, lightweight wrapper following the FazzaAI pattern for basic AI interactions.

```typescript
import { ExnestAI } from './wrapper.services';

const exnest = new ExnestAI("your-api-key", process.env.EXNEST_API_URL || "https://api.exnest.app/v1");

// Simple chat
const response = await exnest.chat("openai:gpt-4o-mini", [
  { role: "user", content: "Hello, how are you?" }
]);

// Quick response
const result = await exnest.response("google:gemini-2.0-flash-exp", "What is TypeScript?", 200);

// Streaming response
for await (const chunk of exnest.stream("openai:gpt-4o-mini", [
  { role: "user", content: "Tell me a story" }
])) {
  if (chunk.choices[0]?.delta?.content) {
    process.stdout.write(chunk.choices[0].delta.content);
  }
}

// Get models
const models = await exnest.getModels();
```

### 2. Client Service (`client.services.ts`)
An advanced client with full configuration options, error handling, and retry logic.

```typescript
import { ExnestAI } from './client.services';

const exnest = new ExnestAI({
  apiKey: "your-api-key",
  baseUrl: process.env.EXNEST_API_URL || "https://api.exnest.app/v1",
  timeout: 30000,
  retries: 3,
  debug: true
});

// Advanced chat with options
const response = await exnest.chat(
  "google:gemini-2.0-flash-exp",
  [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "Explain async/await" }
  ],
  {
    temperature: 0.7,
    maxTokens: 500,
    timeout: 15000,
    openaiCompatible: true
  }
);

// Streaming response with options
for await (const chunk of exnest.stream(
  "openai:gpt-4o-mini",
  [{ role: "user", content: "Write a poem" }],
  { maxTokens: 300 }
)) {
  if (chunk.choices[0]?.delta?.content) {
    process.stdout.write(chunk.choices[0].delta.content);
  }
}

// Get models with options
const models = await exnest.getModels({ openaiCompatible: true });
```

## API Reference

### ExnestMessage Interface
```typescript
interface ExnestMessage {
  role: "system" | "user" | "assistant";
  content: string;
}
```

### ExnestResponse Interface
```typescript
interface ExnestResponse {
  success: boolean;
  status_code: number;
  message: string;
  data?: {
    model: string;
    choices: Array<{
      message: {
        role: string;
        content: string;
      };
    }>;
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  };
  error?: any;
  meta?: {
    timestamp: string;
    request_id: string;
    version: string;
    execution_time: string;
  };
}
```

### ExnestStreamChunk Interface
```typescript
interface ExnestStreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason: string | null;
  }>;
}
```

## Currently Available Models

The services currently support the following AI models:

- **OpenAI**: `openai:gpt-4o-mini` (GPT 4.1 Mini)
- **Google**: `google:gemini-2.0-flash-exp` (Gemini 2.5 Flash)

*Note: More models will be added in the future*

## Authentication

The API supports two authentication methods:

### Method 1: Request Body (Default)
```json
{
  "model": "openai:gpt-4o-mini",
  "messages": [
    {"role": "user", "content": "Hello, how are you?"}
  ],
  "api_key": "your-api-key-here"
}
```

### Method 2: Authorization Bearer Header (n8n Compatible)
```bash
curl -X POST "https://api.exnest.app/v1/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key-here" \
  -d '{
    "model": "openai:gpt-4o-mini",
    "messages": [
      {"role": "user", "content": "Hello, how are you?"}
    ]
  }'
```

### Usage in n8n
When configuring n8n HTTP Request nodes:
1. Set **Authentication** to "Generic Credential Type"
2. Select **"Header Auth"**
3. Set **Name** to `Authorization`
4. Set **Value** to `Bearer your-api-key-here`

This makes the API fully compatible with n8n and other tools that use standard Bearer token authentication.

## Error Handling

The advanced client provides comprehensive error handling with automatic retries:

```typescript
try {
  const response = await exnest.chat(model, messages);
  
  if (!response.success) {
    console.error('API Error:', response.error);
  }
} catch (error) {
  console.error('Network Error:', error);
}
```

## Configuration Options

### ExnestClientOptions
```typescript
interface ExnestClientOptions {
  apiKey: string;           // Required: Your ExnestAI API key
  baseUrl?: string;         // Optional: API base URL (default: https://api.exnest.com/v1)
  timeout?: number;         // Optional: Request timeout in ms (default: 30000)
  retries?: number;         // Optional: Number of retries (default: 3)
  retryDelay?: number;      // Optional: Delay between retries in ms (default: 1000)
  debug?: boolean;          // Optional: Enable debug logging (default: false)
}
```

### ExnestChatOptions
```typescript
interface ExnestChatOptions {
  temperature?: number;     // Optional: Model temperature (0-2)
  maxTokens?: number;       // Optional: Maximum tokens to generate
  timeout?: number;         // Optional: Request-specific timeout
  openaiCompatible?: boolean; // Optional: Return OpenAI-compatible format
  stream?: boolean;         // Optional: Enable streaming response
}
```

## Models API

The SDK also provides access to the models API:

```typescript
// Get all models
const allModels = await exnest.getModels();

// Get models with OpenAI-compatible format
const openaiModels = await exnest.getModels({ openaiCompatible: true });

// Get models by provider
const providerModels = await exnest.getModelsByProvider("openai");

// Get a specific model
const model = await exnest.getModel("gpt-4o-mini");
```

## Streaming Responses

The SDK supports streaming responses for real-time output:

```typescript
// Using the advanced client
for await (const chunk of exnest.stream(
  "openai:gpt-4o-mini",
  [{ role: "user", content: "Tell me a story" }]
)) {
  if (chunk.choices[0]?.delta?.content) {
    process.stdout.write(chunk.choices[0].delta.content);
  }
}

// Using the simple wrapper
for await (const chunk of exnest.stream(
  "openai:gpt-4o-mini",
  [{ role: "user", content: "Count to 100" }],
  200 // maxTokens
)) {
  if (chunk.choices[0]?.delta?.content) {
    process.stdout.write(chunk.choices[0].delta.content);
  }
}
```

## Usage in Express Controllers

The services can be easily integrated into existing Express.js controllers:

```typescript
import { ExnestAI } from '~/services/exnestai';

export const chatController = async (req: Request, res: Response) => {
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
};

// Streaming controller
export const streamController = async (req: Request, res: Response) => {
  const apiKey = req.body.api_key || 
    (req.headers.authorization?.startsWith('Bearer ') ? 
     req.headers.authorization.substring(7) : null);
  
  const exnest = new ExnestAI({ apiKey });
  
  try {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    for await (const chunk of exnest.stream(req.body.model, req.body.messages)) {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }
    
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

## Integration with Billing System

The services are designed to work seamlessly with the existing billing and authentication middleware:

1. **API Key Authentication**: Use the `apiKeyAuth` middleware to validate API keys and prepare billing context
2. **Billing Integration**: The middleware handles token counting, cost estimation, and wallet deduction
3. **Transaction Management**: Failed requests are automatically refunded through the billing system

## Testing and Debugging

### Health Check
```typescript
const health = await exnest.healthCheck();
console.log('Service status:', health.status);
```

### Connection Test
```typescript
const testResult = await exnest.testConnection();
if (testResult.success) {
  console.log('Connection successful');
} else {
  console.error('Connection failed:', testResult.error);
}
```

### Configuration Inspection
```typescript
const config = exnest.getConfig();
console.log('Current configuration:', config);
```

## Examples

See `examples.ts` for comprehensive usage examples including:
- Simple wrapper usage
- Advanced client configuration
- Streaming responses
- Error handling patterns
- Configuration updates
- Model operations
- Controller integration

## File Structure

```
src/services/exnestai/
├── wrapper.services.ts     # Simple wrapper service
├── client.services.ts      # Advanced client service
├── examples.ts            # Usage examples
├── index.ts              # Main export file
└── README.md            # This documentation
```