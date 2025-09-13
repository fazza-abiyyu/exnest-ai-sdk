/**
 * ExnestAI Wrapper Service
 * Simple wrapper class following the FazzaAI pattern for basic AI interactions
 */

export interface ExnestMessage {
  role: "system" | "user" | "assistant";
  content: string;
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
  };
}

export class ExnestAI {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl = process.env.EXNEST_API_URL || "https://api.exnest.app/v1") {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
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

      const response = await fetch(`${this.baseUrl}/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();
      return result;
    } catch (error: any) {
      return {
        success: false,
        status_code: 500,
        message: "Network error occurred",
        error: {
          details: error.message || "Unknown error",
        },
      };
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