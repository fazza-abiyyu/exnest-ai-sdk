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
export declare class ExnestAI {
    private apiKey;
    private baseUrl;
    private timeout;
    private retries;
    private retryDelay;
    private debug;
    constructor({ apiKey, baseUrl, timeout, retries, retryDelay, debug }: ExnestClientOptions);
    /**
     * Advanced chat completion with full options
     * @param model - Model identifier (e.g., "openai:gpt-4", "anthropic:claude-3")
     * @param messages - Array of chat messages
     * @param options - Chat options (temperature, maxTokens, timeout)
     * @returns Promise<ExnestResponse>
     */
    chat(model: string, messages: ExnestMessage[], options?: ExnestChatOptions): Promise<ExnestResponse>;
    /**
     * Simple response method for single-turn conversations
     * @param model - Model identifier
     * @param input - User input string
     * @param maxTokens - Optional maximum tokens to generate
     * @returns Promise<ExnestResponse>
     */
    responses(model: string, input: string, maxTokens?: number): Promise<ExnestResponse>;
    /**
     * Execute HTTP request with retry logic
     * @private
     */
    private executeRequest;
    /**
     * Create standardized error response
     * @private
     */
    private createErrorResponse;
    /**
     * Validate inputs before making request
     * @private
     */
    private validateInputs;
    /**
     * Delay utility for retry logic
     * @private
     */
    private delay;
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
    };
    /**
     * Get masked API key info
     */
    getApiKeyInfo(): string;
    /**
     * Update configuration
     */
    updateConfig(config: Partial<ExnestClientOptions>): void;
    /**
     * Test API connection
     */
    testConnection(): Promise<ExnestResponse>;
    /**
     * Health check method
     */
    healthCheck(): Promise<{
        status: string;
        timestamp: string;
        config: any;
    }>;
}
//# sourceMappingURL=client.services.d.ts.map