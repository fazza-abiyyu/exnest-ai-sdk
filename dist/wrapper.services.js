/**
 * ExnestAI Wrapper Service
 * Simple wrapper class following the FazzaAI pattern for basic AI interactions
 */
export class ExnestAI {
    constructor(apiKey, baseUrl = process.env.EXNEST_API_URL || "https://api.exnest.app/v1") {
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
    async completion(model, prompt, maxTokens) {
        try {
            const requestBody = {
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
        }
        catch (error) {
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
    async chat(model, messages, maxTokens) {
        try {
            const requestBody = {
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
        }
        catch (error) {
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
    async *streamCompletion(model, prompt, maxTokens) {
        try {
            const requestBody = {
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
                    if (done)
                        break;
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
                            }
                            catch (parseError) {
                                console.error("Failed to parse stream chunk:", parseError);
                            }
                        }
                    }
                }
            }
            finally {
                reader.releaseLock();
            }
        }
        catch (error) {
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
    async *stream(model, messages, maxTokens) {
        try {
            const requestBody = {
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
                    if (done)
                        break;
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
                            }
                            catch (parseError) {
                                console.error("Failed to parse stream chunk:", parseError);
                            }
                        }
                    }
                }
            }
            finally {
                reader.releaseLock();
            }
        }
        catch (error) {
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
    async response(model, input, maxTokens) {
        return this.chat(model, [{ role: "user", content: input }], maxTokens);
    }
    /**
     * Get all available models
     * @returns Promise<ExnestResponse>
     */
    async getModels() {
        try {
            const response = await fetch(`${this.baseUrl}/models`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${this.apiKey}`,
                },
            });
            const result = await response.json();
            return result;
        }
        catch (error) {
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
    async getModel(modelName) {
        try {
            const response = await fetch(`${this.baseUrl}/models/${modelName}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${this.apiKey}`,
                },
            });
            const result = await response.json();
            return result;
        }
        catch (error) {
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
    getApiKeyInfo() {
        if (!this.apiKey)
            return "No API key set";
        const visiblePart = this.apiKey.slice(-4);
        return `****${visiblePart}`;
    }
    /**
     * Get the base URL being used
     * @returns string - The base URL
     */
    getBaseUrl() {
        return this.baseUrl;
    }
    /**
     * Update the API key
     * @param newApiKey - New API key to use
     */
    setApiKey(newApiKey) {
        this.apiKey = newApiKey;
    }
    /**
     * Update the base URL
     * @param newBaseUrl - New base URL to use
     */
    setBaseUrl(newBaseUrl) {
        this.baseUrl = newBaseUrl;
    }
}
//# sourceMappingURL=wrapper.services.js.map