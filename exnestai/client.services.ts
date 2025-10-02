/**
 * ExnestAI Client Service
 * Advanced client with full configuration options, error handling, and retry logic
 */

export interface ExnestClientOptions {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  debug?: boolean;
}

export interface ExnestMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ExnestChatOptions {
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
  exnestMetadata?: boolean;  // Enable Exnest-specific metadata (billing, transaction info)
  stream?: boolean;
}

// Base response interface with common OpenAI-compatible fields
export interface ExnestBaseResponse {
  id?: string;
  object?: string;
  created?: number;
  model?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  
  // Exnest-specific metadata (when exnest_metadata=true)
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

// Chat completion response (object: "chat.completion")
export interface ExnestChatResponse extends ExnestBaseResponse {
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

// Text completion response (object: "text_completion")
export interface ExnestCompletionResponse extends ExnestBaseResponse {
  object?: "text_completion";
  choices?: Array<{
    index?: number;
    text?: string;
    finish_reason?: string;
  }>;
}

// Union type for any response
export type ExnestResponse = ExnestChatResponse | ExnestCompletionResponse;

export interface ExnestStreamChunk {
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

// Error response type (can be either chat or completion format with error)
export type ExnestErrorResponse = ExnestBaseResponse & {
  error: {
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
};

export interface ExnestModel {
  id: string;
  name: string;
  displayName: string;
  description: string;
  provider: {
    id: string;
    name: string;
    displayName: string;
  };
  pricing: {
    inputPrice: string;
    outputPrice: string;
    currency: string;
    per: string;
  };
  limits: {
    maxTokens: number;
    contextWindow: number;
  };
  isActive: boolean;
  createdAt: string;
}

export class ExnestAI {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;
  private retries: number;
  private retryDelay: number;
  private debug: boolean;

  constructor({ 
    apiKey, 
    baseUrl = process.env.EXNEST_API_URL || "https://api.exnest.app/v1", 
    timeout = 30000,
    retries = 3,
    retryDelay = 1000,
    debug = false
  }: ExnestClientOptions) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.timeout = timeout;
    this.retries = retries;
    this.retryDelay = retryDelay;
    this.debug = debug;

    if (!apiKey) {
      throw new Error("API key is required");
    }
  }

  /**
   * Simple text completion with single prompt
   * @param model - Model identifier (e.g., "gpt-4.1-mini", "anthropic:claude-3")
   * @param prompt - Single prompt string
   * @param options - Completion options (temperature, maxTokens, timeout)
   * @returns Promise<ExnestCompletionResponse>
   */
  async completion(
    model: string,
    prompt: string,
    options: ExnestChatOptions = {}
  ): Promise<ExnestCompletionResponse> {
    if (!model || typeof model !== "string") {
      throw new Error("Model must be a non-empty string");
    }
    if (!prompt || typeof prompt !== "string") {
      throw new Error("Prompt must be a non-empty string");
    }

    const requestBody: any = {
      model,
      prompt,
      api_key: this.apiKey,
    };

    // Add optional parameters
    if (options.temperature !== undefined) {
      requestBody.temperature = options.temperature;
    }
    if (options.maxTokens !== undefined) {
      requestBody.max_tokens = options.maxTokens;
    }
    if (options.exnestMetadata !== undefined) {
      requestBody.exnest_metadata = options.exnestMetadata;
    }
    if (options.stream !== undefined) {
      requestBody.stream = options.stream;
    }
    if (options.timeout !== undefined) {
      requestBody.timeout = options.timeout;
    }

    const requestTimeout = options.timeout || this.timeout;

    return this.executeRequest("/completions", requestBody, requestTimeout) as Promise<ExnestCompletionResponse>;
  }

  /**
   * Advanced chat completion with full options
   * @param model - Model identifier (e.g., "gpt-4.1-mini", "anthropic:claude-3") 
   * @param messages - Array of chat messages
   * @param options - Chat options (temperature, maxTokens, timeout)
   * @returns Promise<ExnestChatResponse>
   */
  async chat(
    model: string, 
    messages: ExnestMessage[], 
    options: ExnestChatOptions = {}
  ): Promise<ExnestChatResponse> {
    this.validateInputs(model, messages);

    const requestBody: any = {
      model,
      messages,
      api_key: this.apiKey,
    };

    // Add optional parameters
    if (options.temperature !== undefined) {
      requestBody.temperature = options.temperature;
    }
    if (options.maxTokens !== undefined) {
      requestBody.max_tokens = options.maxTokens;
    }
    if (options.exnestMetadata !== undefined) {
      requestBody.exnest_metadata = options.exnestMetadata;
    }
    if (options.stream !== undefined) {
      requestBody.stream = options.stream;
    }
    if (options.timeout !== undefined) {
      requestBody.timeout = options.timeout;
    }

    const requestTimeout = options.timeout || this.timeout;

    return this.executeRequest("/chat/completions", requestBody, requestTimeout) as Promise<ExnestChatResponse>;
  }

  /**
   * Stream text completion with single prompt
   * @param model - Model identifier
   * @param prompt - Single prompt string
   * @param options - Completion options
   * @returns AsyncGenerator<ExnestStreamChunk>
   */
  async *streamCompletion(
    model: string,
    prompt: string,
    options: ExnestChatOptions = {}
  ): AsyncGenerator<ExnestStreamChunk, void, unknown> {
    if (!model || typeof model !== "string") {
      throw new Error("Model must be a non-empty string");
    }
    if (!prompt || typeof prompt !== "string") {
      throw new Error("Prompt must be a non-empty string");
    }

    const requestBody: any = {
      model,
      prompt,
      api_key: this.apiKey,
      stream: true,
    };

    // Add optional parameters
    if (options.temperature !== undefined) {
      requestBody.temperature = options.temperature;
    }
    if (options.maxTokens !== undefined) {
      requestBody.max_tokens = options.maxTokens;
    }
    if (options.exnestMetadata !== undefined) {
      requestBody.exnest_metadata = options.exnestMetadata;
    }
    if (options.timeout !== undefined) {
      requestBody.timeout = options.timeout;
    }

    const requestTimeout = options.timeout || this.timeout;

    yield* this.executeStreamRequest("/completions", requestBody, requestTimeout);
  }

  /**
   * Stream chat completion responses
   * @param model - Model identifier
   * @param messages - Array of chat messages
   * @param options - Chat options
   * @returns AsyncGenerator<ExnestStreamChunk>
   */
  async *stream(
    model: string,
    messages: ExnestMessage[],
    options: ExnestChatOptions = {}
  ): AsyncGenerator<ExnestStreamChunk, void, unknown> {
    this.validateInputs(model, messages);

    const requestBody: any = {
      model,
      messages,
      api_key: this.apiKey,
      stream: true,
    };

    // Add optional parameters
    if (options.temperature !== undefined) {
      requestBody.temperature = options.temperature;
    }
    if (options.maxTokens !== undefined) {
      requestBody.max_tokens = options.maxTokens;
    }
    if (options.exnestMetadata !== undefined) {
      requestBody.exnest_metadata = options.exnestMetadata;
    }
    if (options.timeout !== undefined) {
      requestBody.timeout = options.timeout;
    }

    const requestTimeout = options.timeout || this.timeout;

    yield* this.executeStreamRequest("/chat/completions", requestBody, requestTimeout);
  }

  /**
   * Simple response method for single-turn conversations
   * @param model - Model identifier
   * @param input - User input string
   * @param maxTokens - Optional maximum tokens to generate
   * @returns Promise<ExnestChatResponse>
   */
  async responses(
    model: string, 
    input: string, 
    maxTokens = 200
  ): Promise<ExnestChatResponse> {
    if (!input || typeof input !== "string") {
      throw new Error("Input must be a non-empty string");
    }

    return this.chat(model, [{ role: "user", content: input }], { maxTokens });
  }

  /**
   * Get all available models
   * @param options - Options for the request
   * @returns Promise<ExnestResponse>
   */
  async getModels(options: { openaiCompatible?: boolean; timeout?: number } = {}): Promise<ExnestResponse> {
    const queryParams = new URLSearchParams();
    if (options.openaiCompatible) {
      queryParams.append('openai_compatible', 'true');
    }

    const endpoint = `/models${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const requestTimeout = options.timeout || this.timeout;

    return this.executeRequest(endpoint, null, requestTimeout, 'GET');
  }

  /**
   * Get a specific model by name
   * @param modelName - Name of the model to retrieve
   * @param options - Options for the request
   * @returns Promise<ExnestResponse>
   */
  async getModel(
    modelName: string,
    options: { openaiCompatible?: boolean; timeout?: number } = {}
  ): Promise<ExnestResponse> {
    const queryParams = new URLSearchParams();
    if (options.openaiCompatible) {
      queryParams.append('openai_compatible', 'true');
    }

    const endpoint = `/models/${modelName}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const requestTimeout = options.timeout || this.timeout;

    return this.executeRequest(endpoint, null, requestTimeout, 'GET');
  }

  /**
   * Get models by provider
   * @param provider - Provider name
   * @param options - Options for the request
   * @returns Promise<ExnestResponse>
   */
  async getModelsByProvider(
    provider: string,
    options: { openaiCompatible?: boolean; timeout?: number } = {}
  ): Promise<ExnestResponse> {
    const queryParams = new URLSearchParams();
    if (options.openaiCompatible) {
      queryParams.append('openai_compatible', 'true');
    }

    const endpoint = `/models/provider/${provider}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const requestTimeout = options.timeout || this.timeout;

    return this.executeRequest(endpoint, null, requestTimeout, 'GET');
  }

  /**
   * Execute HTTP request with retry logic
   * @private
   */
  private async executeRequest(
    endpoint: string, 
    body: any, 
    timeout: number,
    method: 'GET' | 'POST' = 'POST'
  ): Promise<ExnestResponse> {
    let lastError: any = null;

    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        if (this.debug) {
          console.log(`[ExnestAI] Attempt ${attempt + 1}/${this.retries + 1} - ${endpoint}`);
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "User-Agent": "ExnestAI-Client/1.0.0",
        };

        // Add API key to Authorization header for better compatibility
        headers["Authorization"] = `Bearer ${this.apiKey}`;

        const fetchOptions: RequestInit = {
          method,
          headers,
          signal: controller.signal,
        };

        // Add body for POST requests
        if (method === 'POST' && body) {
          fetchOptions.body = JSON.stringify(body);
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, fetchOptions);

        clearTimeout(timeoutId);

        const result = await response.json();

        if (this.debug) {
          console.log(`[ExnestAI] Response status: ${response.status}`);
          console.log(`[ExnestAI] Response body:`, result);
        }

        // Return the result regardless of success/failure status
        // The server's response format already includes success/error information
        return result;

      } catch (error: any) {
        lastError = error;
        
        if (this.debug) {
          console.error(`[ExnestAI] Attempt ${attempt + 1} failed:`, error.message);
        }

        // Don't retry on the last attempt
        if (attempt < this.retries) {
          await this.delay(this.retryDelay * (attempt + 1)); // Exponential backoff
        }
      }
    }

    // If all retries failed, return a formatted error response
    return this.createErrorResponse(lastError) as ExnestResponse;
  }

  /**
   * Execute streaming HTTP request
   * @private
   */
  private async *executeStreamRequest(
    endpoint: string,
    body: any,
    timeout: number
  ): AsyncGenerator<ExnestStreamChunk, void, unknown> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "User-Agent": "ExnestAI-Client/1.0.0",
        "Accept": "text/event-stream",
      };

      // Add API key to Authorization header for better compatibility
      headers["Authorization"] = `Bearer ${this.apiKey}`;

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.body) {
        throw new Error("Response body is null");
      }

      if (!response.headers.get("content-type")?.includes("text/event-stream")) {
        // Handle non-streaming response (likely an error)
        const result = await response.json();
        throw new Error(result.message || "Streaming request failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") {
                return;
              }
              try {
                const chunk = JSON.parse(data);
                yield chunk;
              } catch (parseError) {
                if (this.debug) {
                  console.error("[ExnestAI] Failed to parse stream chunk:", parseError);
                }
              }
            }
          }
        }

        // Process any remaining data in the buffer
        if (buffer.startsWith("data: ")) {
          const data = buffer.slice(6);
          if (data !== "[DONE]") {
            try {
              const chunk = JSON.parse(data);
              yield chunk;
            } catch (parseError) {
              if (this.debug) {
                console.error("[ExnestAI] Failed to parse final stream chunk:", parseError);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error: any) {
      throw new Error(`Streaming failed: ${error.message}`);
    }
  }

  /**
   * Create standardized error response
   * @private
   */
  private createErrorResponse(error: any): ExnestErrorResponse {
    let message = "Network error occurred";
    let code = "network_error";
    let type = "client_error";

    if (error.name === "AbortError") {
      message = "Request timeout";
      code = "timeout";
      type = "timeout_error";
    } else if (error.message) {
      message = error.message;
    }

    return {
      error: {
        message,
        code,
        type,
        exnest: {
          details: message,
          processing_time_ms: 0,
        },
      },
    } as ExnestErrorResponse;
  }

  /**
   * Validate inputs before making request
   * @private
   */
  private validateInputs(model: string, messages: ExnestMessage[]): void {
    if (!model || typeof model !== "string") {
      throw new Error("Model must be a non-empty string");
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error("Messages must be a non-empty array");
    }

    for (const message of messages) {
      if (!message.role || !["system", "user", "assistant"].includes(message.role)) {
        throw new Error("Each message must have a valid role (system, user, or assistant)");
      }
      if (!message.content || typeof message.content !== "string") {
        throw new Error("Each message must have non-empty content");
      }
    }
  }

  /**
   * Delay utility for retry logic
   * @private
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get client configuration information
   */
  getConfig(): {
    baseUrl: string;
    timeout: number;
    retries: number;
    retryDelay: number;
    debug: boolean;
    apiKey: string;
  } {
    return {
      baseUrl: this.baseUrl,
      timeout: this.timeout,
      retries: this.retries,
      retryDelay: this.retryDelay,
      debug: this.debug,
      apiKey: this.getApiKeyInfo(),
    };
  }

  /**
   * Get masked API key info
   */
  getApiKeyInfo(): string {
    if (!this.apiKey) return "No API key set";
    const visiblePart = this.apiKey.slice(-4);
    return `****${visiblePart}`;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ExnestClientOptions>): void {
    if (config.apiKey) this.apiKey = config.apiKey;
    if (config.baseUrl) this.baseUrl = config.baseUrl;
    if (config.timeout !== undefined) this.timeout = config.timeout;
    if (config.retries !== undefined) this.retries = config.retries;
    if (config.retryDelay !== undefined) this.retryDelay = config.retryDelay;
    if (config.debug !== undefined) this.debug = config.debug;
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<ExnestResponse> {
    try {
      return await this.responses("openai:gpt-3.5-turbo", "Hello", 5);
    } catch (error: any) {
      return this.createErrorResponse(error) as ExnestResponse;
    }
  }

  /**
   * Health check method
   */
  async healthCheck(): Promise<{ status: string; timestamp: string; config: any }> {
    const testResult = await this.testConnection();
    
    return {
      status: testResult.error ? "unhealthy" : "healthy",
      timestamp: new Date().toISOString(),
      config: this.getConfig(),
    };
  }
}