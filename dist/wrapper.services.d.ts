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
export declare class ExnestAI {
    private apiKey;
    private baseUrl;
    constructor(apiKey: string, baseUrl?: string);
    /**
     * Simple chat completion method
     * @param model - Model identifier (e.g., "openai:gpt-4", "anthropic:claude-3")
     * @param messages - Array of chat messages
     * @param maxTokens - Optional maximum tokens to generate
     * @returns Promise<ExnestResponse>
     */
    chat(model: string, messages: ExnestMessage[], maxTokens?: number): Promise<ExnestResponse>;
    /**
     * Stream chat completion responses
     * @param model - Model identifier
     * @param messages - Array of chat messages
     * @param maxTokens - Optional maximum tokens to generate
     * @returns AsyncGenerator<ExnestStreamChunk>
     */
    stream(model: string, messages: ExnestMessage[], maxTokens?: number): AsyncGenerator<ExnestStreamChunk, void, unknown>;
    /**
     * Simple response method for single-turn conversations
     * @param model - Model identifier
     * @param input - User input string
     * @param maxTokens - Optional maximum tokens to generate
     * @returns Promise<ExnestResponse>
     */
    response(model: string, input: string, maxTokens?: number): Promise<ExnestResponse>;
    /**
     * Get all available models
     * @returns Promise<ExnestResponse>
     */
    getModels(): Promise<ExnestResponse>;
    /**
     * Get a specific model by name
     * @param modelName - Name of the model to retrieve
     * @returns Promise<ExnestResponse>
     */
    getModel(modelName: string): Promise<ExnestResponse>;
    /**
     * Get the API key being used (useful for debugging)
     * @returns string - The API key (masked for security)
     */
    getApiKeyInfo(): string;
    /**
     * Get the base URL being used
     * @returns string - The base URL
     */
    getBaseUrl(): string;
    /**
     * Update the API key
     * @param newApiKey - New API key to use
     */
    setApiKey(newApiKey: string): void;
    /**
     * Update the base URL
     * @param newBaseUrl - New base URL to use
     */
    setBaseUrl(newBaseUrl: string): void;
}
//# sourceMappingURL=wrapper.services.d.ts.map