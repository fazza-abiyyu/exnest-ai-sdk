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
}

export interface ExnestResponse {
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
    execution_time_ms?: number;
  };
}

export interface ExnestErrorResponse {
  success: false;
  status_code: number;
  message: string;
  error: {
    details: string;
    code?: string;
    type?: string;
  };
  requestId?: string;
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
   * Advanced chat completion with full options
   * @param model - Model identifier (e.g., "openai:gpt-4", "anthropic:claude-3") 
   * @param messages - Array of chat messages
   * @param options - Chat options (temperature, maxTokens, timeout)
   * @returns Promise<ExnestResponse>
   */
  async chat(
    model: string, 
    messages: ExnestMessage[], 
    options: ExnestChatOptions = {}
  ): Promise<ExnestResponse> {
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

    const requestTimeout = options.timeout || this.timeout;

    return this.executeRequest("/completions", requestBody, requestTimeout);
  }

  /**
   * Simple response method for single-turn conversations
   * @param model - Model identifier
   * @param input - User input string
   * @param maxTokens - Optional maximum tokens to generate
   * @returns Promise<ExnestResponse>
   */
  async responses(
    model: string, 
    input: string, 
    maxTokens = 200
  ): Promise<ExnestResponse> {
    if (!input || typeof input !== "string") {
      throw new Error("Input must be a non-empty string");
    }

    return this.chat(model, [{ role: "user", content: input }], { maxTokens });
  }

  /**
   * Execute HTTP request with retry logic
   * @private
   */
  private async executeRequest(
    endpoint: string, 
    body: any, 
    timeout: number
  ): Promise<ExnestResponse> {
    let lastError: any = null;

    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        if (this.debug) {
          console.log(`[ExnestAI] Attempt ${attempt + 1}/${this.retries + 1} - ${endpoint}`);
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "ExnestAI-Client/1.0.0",
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

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
    return this.createErrorResponse(lastError);
  }

  /**
   * Create standardized error response
   * @private
   */
  private createErrorResponse(error: any): ExnestErrorResponse {
    let message = "Network error occurred";
    let code = "NETWORK_ERROR";

    if (error.name === "AbortError") {
      message = "Request timeout";
      code = "TIMEOUT";
    } else if (error.message) {
      message = error.message;
    }

    return {
      success: false,
      status_code: 500,
      message,
      error: {
        details: message,
        code,
        type: "CLIENT_ERROR",
      },
      requestId: `req_${Date.now()}`,
    };
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
      return this.createErrorResponse(error);
    }
  }

  /**
   * Health check method
   */
  async healthCheck(): Promise<{ status: string; timestamp: string; config: any }> {
    const testResult = await this.testConnection();
    
    return {
      status: testResult.success ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      config: this.getConfig(),
    };
  }
}