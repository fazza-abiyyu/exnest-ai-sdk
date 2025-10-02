# ExnestAI Client Services

This directory contains the client services for interacting with the ExnestAI API. It provides two main implementations with **OpenAI-compatible response format** by default.

## Services Overview

### 1. Wrapper Service (`wrapper.services.ts`)
A simple, lightweight wrapper following the FazzaAI pattern for basic AI interactions.

```typescript
import { ExnestAI } from './wrapper.services';

const exnest = new ExnestAI("your-api-key", process.env.EXNEST_API_URL || "https://api.exnest.app/v1");

// Text completion with single prompt
const completionResponse = await exnest.completion(
  "openai:gpt-4o-mini",
  "What is the capital of France?",
  500 // maxTokens
);

// Chat completion with messages array
const chatResponse = await exnest.chat("openai:gpt-4o-mini", [
  { role: "user", content: "Hello, how are you?" }
]);

// Quick response (legacy method)
const result = await exnest.response("google:gemini-2.0-flash-exp", "What is TypeScript?", 200);

// Streaming text completion
for await (const chunk of exnest.streamCompletion(
  "openai:gpt-4o-mini",
  "Tell me a story",
  500 // maxTokens
)) {
  if (chunk.choices[0]?.delta?.content) {
    process.stdout.write(chunk.choices[0].delta.content);
  }
}

// Streaming chat completion
for await (const chunk of exnest.stream("openai:gpt-4o-mini", [
  { role: "user", content: "Count to 100" }
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

// Text completion with single prompt (uses /v1/completions endpoint)
const completionResponse = await exnest.completion(
  "openai:gpt-4o-mini",
  "What is the capital of France?",
  {
    temperature: 0.7,
    maxTokens: 500,
    timeout: 15000,
    exnestMetadata: true  // Enable Exnest billing metadata
  }
);
// Returns: { object: "text_completion", choices: [{ text: "...", ... }], ... }

// Chat completion with messages array (uses /v1/chat/completions endpoint)
const chatResponse = await exnest.chat(
  "google:gemini-2.0-flash-exp",
  [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "Explain async/await" }
  ],
  {
    temperature: 0.7,
    maxTokens: 500,
    timeout: 15000,
    exnestMetadata: true  // Enable Exnest billing metadata
  }
);
// Returns: { object: "chat.completion", choices: [{ message: {...}, ... }], ... }

// Streaming text completion with single prompt
for await (const chunk of exnest.streamCompletion(
  "openai:gpt-4o-mini",
  "Write a short story about a robot",
  { maxTokens: 300 }
)) {
  if (chunk.choices[0]?.delta?.content) {
    process.stdout.write(chunk.choices[0].delta.content);
  }
}

// Streaming chat completion with messages array
for await (const chunk of exnest.stream(
  "openai:gpt-4o-mini",
  [{ role: "user", content: "Write a poem" }],
  { maxTokens: 300 }
)) {
  if (chunk.choices[0]?.delta?.content) {
    process.stdout.write(chunk.choices[0].delta.content);
  }
}

// Get all models
const models = await exnest.getModels();
```

## API Reference

### ExnestMessage Interface
```typescript
interface ExnestMessage {
  role: "system" | "user" | "assistant";
  content: string;
}
```

### Response Type System (OpenAI Compatible)

All responses follow OpenAI's format with optional Exnest metadata.

#### Base Response Interface
```typescript
interface ExnestBaseResponse {
  id?: string;
  object?: string;  // "chat.completion" or "text_completion"
  created?: number;
  model?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  
  // Exnest-specific metadata (when exnestMetadata=true)
  exnest?: {
    billing?: {
      transaction_id: string;
      actual_cost_usd: string;
      estimated_cost_usd: string;
      refund_amount_usd: string;
      wallet_currency: string;
      deducted_amount: string;
      exchange_rate: string | null;
    };
    links?: {
      transaction: string;
      apiKey: string;
    };
    processing_time_ms?: number;
  };
  
  // Error fields (OpenAI compatible)
  error?: {
    message: string;
    type: string;
    code: string;
    exnest?: {
      transaction_refunded?: boolean;
      processing_time_ms?: number;
      original_error?: string;
      details?: string;
    };
  };
}
```

#### Chat Completion Response (from /v1/chat/completions)
```typescript
interface ExnestChatResponse extends ExnestBaseResponse {
  object?: "chat.completion";
  choices?: Array<{
    index?: number;
    message?: {
      role: string;
      content: string;
    };
    finish_reason?: string;
  }>;
}
```

#### Text Completion Response (from /v1/completions)
```typescript
interface ExnestCompletionResponse extends ExnestBaseResponse {
  object?: "text_completion";
  choices?: Array<{
    index?: number;
    text?: string;
    finish_reason?: string;
  }>;
}
```

#### Union Type for Any Response
```typescript
type ExnestResponse = ExnestChatResponse | ExnestCompletionResponse;
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

## API Endpoints

The ExnestAI service provides two distinct endpoints for different use cases:

### `/v1/completions` - Text Completion
- **Input**: Single `prompt` string
- **Output**: `{ object: "text_completion", choices: [{ text: "..." }] }`
- **Use case**: Simple text generation, single prompt/response
- **Methods**: `completion()`, `streamCompletion()`

### `/v1/chat/completions` - Chat Completion
- **Input**: Array of `messages` with roles
- **Output**: `{ object: "chat.completion", choices: [{ message: {...} }] }`
- **Use case**: Conversational AI, multi-turn dialogue
- **Methods**: `chat()`, `stream()`

Both endpoints:
- Return OpenAI-compatible format by default
- Support optional `exnest_metadata=true` for billing info
- Support streaming with Server-Sent Events (SSE)
- Support timeout configuration

## Currently Available Models

The services currently support the following AI models:

- **OpenAI**: `openai:gpt-4o-mini` (GPT 4.1 Mini)
- **Google**: `google:gemini-2.0-flash-exp` (Gemini 2.5 Flash)

*Note: More models will be added in the future*

## Authentication

The API supports two authentication methods:

### Method 1: Request Body (Default)

**For Chat Completion (messages array):**
```json
{
  "model": "openai:gpt-4o-mini",
  "messages": [
    {"role": "user", "content": "Hello, how are you?"}
  ],
  "api_key": "your-api-key-here"
}
```

**For Text Completion (single prompt):**
```json
{
  "model": "openai:gpt-4o-mini",
  "prompt": "What is the capital of France?",
  "api_key": "your-api-key-here"
}
```

### Method 2: Authorization Bearer Header (n8n Compatible)

**For Chat Completion:**
```bash
curl -X POST "https://api.exnest.app/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key-here" \
  -d '{
    "model": "openai:gpt-4o-mini",
    "messages": [
      {"role": "user", "content": "Hello, how are you?"}
    ]
  }'
```

**For Text Completion:**
```bash
curl -X POST "https://api.exnest.app/v1/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key-here" \
  -d '{
    "model": "openai:gpt-4o-mini",
    "prompt": "What is the capital of France?"
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
  
  // OpenAI compatible error format
  if (response.error) {
    console.error('API Error:', response.error.message);
    console.error('Error Type:', response.error.type);
    console.error('Error Code:', response.error.code);
    
    // Check for Exnest-specific error details
    if (response.error.exnest) {
      console.error('Details:', response.error.exnest.details);
    }
  } else {
    // Success - use choices
    console.log(response.choices?.[0]?.message?.content);
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
  exnestMetadata?: boolean; // Optional: Include Exnest billing/transaction metadata
  stream?: boolean;         // Optional: Enable streaming response
}
```

## Models API

The SDK also provides access to the models API:

```typescript
// Get all models
const allModels = await exnest.getModels();

// Get models by provider
const providerModels = await exnest.getModelsByProvider("openai");

// Get a specific model
const model = await exnest.getModel("gpt-4o-mini");

// Note: All model responses are OpenAI-compatible by default
```

## Streaming Responses

The SDK supports streaming responses for real-time output with two methods:

### Stream Text Completion (single prompt)
```typescript
// Using the advanced client
for await (const chunk of exnest.streamCompletion(
  "openai:gpt-4o-mini",
  "Write a short story about a robot"
)) {
  if (chunk.choices[0]?.delta?.content) {
    process.stdout.write(chunk.choices[0].delta.content);
  }
}

// Using the simple wrapper
for await (const chunk of exnest.streamCompletion(
  "openai:gpt-4o-mini",
  "Count to 100",
  200 // maxTokens
)) {
  if (chunk.choices[0]?.delta?.content) {
    process.stdout.write(chunk.choices[0].delta.content);
  }
}
```

### Stream Chat Completion (messages array)
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
  [{ role: "user", content: "Write a poem" }],
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