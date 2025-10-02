/**
 * ExnestAI Wrapper Service
 * Simple wrapper class following the FazzaAI pattern for basic AI interactions
 */

export interface ExnestMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ExnestResponse {
  // OpenAI Compatible fields
  id?: string;
  object?: string;  // "chat.completion" or "text_completion"
  created?: number;
  model?: string;
  choices?: Array<{
    index?: number;
    // For chat completions
    message?: {
      role: string;
      content: string;
    };
    // For text completions
    text?: string;
    finish_reason?: string;
  }>;
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

export class ExnestAI {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl = process.env.EXNEST_API_URL || "https://api.exnest.app/v1") {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  /**
   * Simple completion method with single prompt
   * @param model - Model identifier (e.g., "openai:gpt-4", "anthropic:claude-3")
   * @param prompt - Single prompt string
   * @param maxTokens - Optional maximum tokens to generate
   * @returns Promise<ExnestResponse>
   */
  async completion(
    model: string,
    prompt: string,
    maxTokens?: number
  ): Promise<ExnestResponse> {
    try {
      const requestBody: any = {
        model,
        prompt,
        api_key: this.apiKey,
      };

      if (maxTokens) {
        requestBody.max_tokens = maxTokens;
      }

      const response = await fetch(`${this.baseUrl}/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();
      return result;
    } catch (error: any) {
      return {
        error: {
          message: "Network error occurred",
          type: "client_error",
          code: "network_error",
          exnest: {
            details: error.message || "Unknown error",
          },
        },
      };
    }
  }

  /**
   * Simple chat completion method
   * @param model - Model identifier (e.g., "openai:gpt-4", "anthropic:claude-3")
   * @param messages - Array of chat messages
   * @param maxTokens - Optional maximum tokens to generate
   * @returns Promise<ExnestResponse>
   */
  async chat(
    model: string, 
    messages: ExnestMessage[], 
    maxTokens?: number
  ): Promise<ExnestResponse> {
    try {
      const requestBody: any = {
        model,
        messages,
        api_key: this.apiKey,
      };

      if (maxTokens) {
        requestBody.max_tokens = maxTokens;
      }

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();
      return result;
    } catch (error: any) {
      return {
        error: {
          message: "Network error occurred",
          type: "client_error",
          code: "network_error",
          exnest: {
            details: error.message || "Unknown error",
          },
        },
      };
    }
  }

  /**
   * Stream completion with single prompt
   * @param model - Model identifier
   * @param prompt - Single prompt string
   * @param maxTokens - Optional maximum tokens to generate
   * @returns AsyncGenerator<ExnestStreamChunk>
   */
  async *streamCompletion(
    model: string,
    prompt: string,
    maxTokens?: number
  ): AsyncGenerator<ExnestStreamChunk, void, unknown> {
    try {
      const requestBody: any = {
        model,
        prompt,
        api_key: this.apiKey,
        stream: true,
      };

      if (maxTokens) {
        requestBody.max_tokens = maxTokens;
      }

      const response = await fetch(`${this.baseUrl}/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
          "Accept": "text/event-stream",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.body) {
        throw new Error("Response body is null");
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
                console.error("Failed to parse stream chunk:", parseError);
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
   * Stream chat completion responses
   * @param model - Model identifier
   * @param messages - Array of chat messages
   * @param maxTokens - Optional maximum tokens to generate
   * @returns AsyncGenerator<ExnestStreamChunk>
   */
  async *stream(
    model: string,
    messages: ExnestMessage[],
    maxTokens?: number
  ): AsyncGenerator<ExnestStreamChunk, void, unknown> {
    try {
      const requestBody: any = {
        model,
        messages,
        api_key: this.apiKey,
        stream: true,
      };

      if (maxTokens) {
        requestBody.max_tokens = maxTokens;
      }

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
          "Accept": "text/event-stream",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.body) {
        throw new Error("Response body is null");
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
                console.error("Failed to parse stream chunk:", parseError);
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
   * Simple response method for single-turn conversations
   * @param model - Model identifier
   * @param input - User input string
   * @param maxTokens - Optional maximum tokens to generate
   * @returns Promise<ExnestResponse>
   */
  async response(
    model: string, 
    input: string, 
    maxTokens?: number
  ): Promise<ExnestResponse> {
    return this.chat(model, [{ role: "user", content: input }], maxTokens);
  }

  /**
   * Get all available models
   * @returns Promise<ExnestResponse>
   */
  async getModels(): Promise<ExnestResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
        },
      });

      const result = await response.json();
      return result;
    } catch (error: any) {
      return {
        error: {
          message: "Network error occurred",
          type: "client_error",
          code: "network_error",
          exnest: {
            details: error.message || "Unknown error",
          },
        },
      };
    }
  }

  /**
   * Get a specific model by name
   * @param modelName - Name of the model to retrieve
   * @returns Promise<ExnestResponse>
   */
  async getModel(modelName: string): Promise<ExnestResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/models/${modelName}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
        },
      });

      const result = await response.json();
      return result;
    } catch (error: any) {
      return {
        error: {
          message: "Network error occurred",
          type: "client_error",
          code: "network_error",
          exnest: {
            details: error.message || "Unknown error",
          },
        },
      };
    }
  }

  /**
   * Get the API key being used (useful for debugging)
   * @returns string - The API key (masked for security)
   */
  getApiKeyInfo(): string {
    if (!this.apiKey) return "No API key set";
    const visiblePart = this.apiKey.slice(-4);
    return `****${visiblePart}`;
  }

  /**
   * Get the base URL being used
   * @returns string - The base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Update the API key
   * @param newApiKey - New API key to use
   */
  setApiKey(newApiKey: string): void {
    this.apiKey = newApiKey;
  }

  /**
   * Update the base URL
   * @param newBaseUrl - New base URL to use
   */
  setBaseUrl(newBaseUrl: string): void {
    this.baseUrl = newBaseUrl;
  }
}