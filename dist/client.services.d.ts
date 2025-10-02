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
    exnestMetadata?: boolean;
    stream?: boolean;
}
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
export interface ExnestCompletionResponse extends ExnestBaseResponse {
    object?: "text_completion";
    choices?: Array<{
        index?: number;
        text?: string;
        finish_reason?: string;
    }>;
}
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
export declare class ExnestAI {
    private apiKey;
    private baseUrl;
    private timeout;
    private retries;
    private retryDelay;
    private debug;
    constructor({ apiKey, baseUrl, timeout, retries, retryDelay, debug }: ExnestClientOptions);
    /**
     * Simple text completion with single prompt
     * @param model - Model identifier (e.g., "gpt-4.1-mini", "anthropic:claude-3")
     * @param prompt - Single prompt string
     * @param options - Completion options (temperature, maxTokens, timeout)
     * @returns Promise<ExnestCompletionResponse>
     */
    completion(model: string, prompt: string, options?: ExnestChatOptions): Promise<ExnestCompletionResponse>;
    /**
     * Advanced chat completion with full options
     * @param model - Model identifier (e.g., "gpt-4.1-mini", "anthropic:claude-3")
     * @param messages - Array of chat messages
     * @param options - Chat options (temperature, maxTokens, timeout)
     * @returns Promise<ExnestChatResponse>
     */
    chat(model: string, messages: ExnestMessage[], options?: ExnestChatOptions): Promise<ExnestChatResponse>;
    /**
     * Stream text completion with single prompt
     * @param model - Model identifier
     * @param prompt - Single prompt string
     * @param options - Completion options
     * @returns AsyncGenerator<ExnestStreamChunk>
     */
    streamCompletion(model: string, prompt: string, options?: ExnestChatOptions): AsyncGenerator<ExnestStreamChunk, void, unknown>;
    /**
     * Stream chat completion responses
     * @param model - Model identifier
     * @param messages - Array of chat messages
     * @param options - Chat options
     * @returns AsyncGenerator<ExnestStreamChunk>
     */
    stream(model: string, messages: ExnestMessage[], options?: ExnestChatOptions): AsyncGenerator<ExnestStreamChunk, void, unknown>;
    /**
     * Simple response method for single-turn conversations
     * @param model - Model identifier
     * @param input - User input string
     * @param maxTokens - Optional maximum tokens to generate
     * @returns Promise<ExnestChatResponse>
     */
    responses(model: string, input: string, maxTokens?: number): Promise<ExnestChatResponse>;
    /**
     * Get all available models
     * @param options - Options for the request
     * @returns Promise<ExnestResponse>
     */
    getModels(options?: {
        openaiCompatible?: boolean;
        timeout?: number;
    }): Promise<ExnestResponse>;
    /**
     * Get a specific model by name
     * @param modelName - Name of the model to retrieve
     * @param options - Options for the request
     * @returns Promise<ExnestResponse>
     */
    getModel(modelName: string, options?: {
        openaiCompatible?: boolean;
        timeout?: number;
    }): Promise<ExnestResponse>;
    /**
     * Get models by provider
     * @param provider - Provider name
     * @param options - Options for the request
     * @returns Promise<ExnestResponse>
     */
    getModelsByProvider(provider: string, options?: {
        openaiCompatible?: boolean;
        timeout?: number;
    }): Promise<ExnestResponse>;
    /**
     * Execute HTTP request with retry logic
     * @private
     */
    private executeRequest;
    /**
     * Execute streaming HTTP request
     * @private
     */
    private executeStreamRequest;
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