"use strict";
/**
 * ExnestAI Client Service
 * Advanced client with full configuration options, error handling, and retry logic
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExnestAI = void 0;
class ExnestAI {
    constructor({ apiKey, baseUrl = process.env.EXNEST_API_URL || "https://api.exnest.app/v1", timeout = 30000, retries = 3, retryDelay = 1000, debug = false }) {
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
    async completion(model, prompt, options = {}) {
        if (!model || typeof model !== "string") {
            throw new Error("Model must be a non-empty string");
        }
        if (!prompt || typeof prompt !== "string") {
            throw new Error("Prompt must be a non-empty string");
        }
        const requestBody = {
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
        return this.executeRequest("/completions", requestBody, requestTimeout);
    }
    /**
     * Advanced chat completion with full options
     * @param model - Model identifier (e.g., "gpt-4.1-mini", "anthropic:claude-3")
     * @param messages - Array of chat messages
     * @param options - Chat options (temperature, maxTokens, timeout)
     * @returns Promise<ExnestChatResponse>
     */
    async chat(model, messages, options = {}) {
        this.validateInputs(model, messages);
        const requestBody = {
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
        return this.executeRequest("/chat/completions", requestBody, requestTimeout);
    }
    /**
     * Stream text completion with single prompt
     * @param model - Model identifier
     * @param prompt - Single prompt string
     * @param options - Completion options
     * @returns AsyncGenerator<ExnestStreamChunk>
     */
    async *streamCompletion(model, prompt, options = {}) {
        if (!model || typeof model !== "string") {
            throw new Error("Model must be a non-empty string");
        }
        if (!prompt || typeof prompt !== "string") {
            throw new Error("Prompt must be a non-empty string");
        }
        const requestBody = {
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
    async *stream(model, messages, options = {}) {
        this.validateInputs(model, messages);
        const requestBody = {
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
    async responses(model, input, maxTokens = 200) {
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
    async getModels(options = {}) {
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
    async getModel(modelName, options = {}) {
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
    async getModelsByProvider(provider, options = {}) {
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
    async executeRequest(endpoint, body, timeout, method = 'POST') {
        let lastError = null;
        for (let attempt = 0; attempt <= this.retries; attempt++) {
            try {
                if (this.debug) {
                    console.log(`[ExnestAI] Attempt ${attempt + 1}/${this.retries + 1} - ${endpoint}`);
                }
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), timeout);
                const headers = {
                    "Content-Type": "application/json",
                    "User-Agent": "ExnestAI-Client/1.0.0",
                };
                // Add API key to Authorization header for better compatibility
                headers["Authorization"] = `Bearer ${this.apiKey}`;
                const fetchOptions = {
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
            }
            catch (error) {
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
     * Execute streaming HTTP request
     * @private
     */
    async *executeStreamRequest(endpoint, body, timeout) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);
            const headers = {
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
                        }
                        catch (parseError) {
                            if (this.debug) {
                                console.error("[ExnestAI] Failed to parse final stream chunk:", parseError);
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
     * Create standardized error response
     * @private
     */
    createErrorResponse(error) {
        let message = "Network error occurred";
        let code = "network_error";
        let type = "client_error";
        if (error.name === "AbortError") {
            message = "Request timeout";
            code = "timeout";
            type = "timeout_error";
        }
        else if (error.message) {
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
        };
    }
    /**
     * Validate inputs before making request
     * @private
     */
    validateInputs(model, messages) {
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
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Get client configuration information
     */
    getConfig() {
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
    getApiKeyInfo() {
        if (!this.apiKey)
            return "No API key set";
        const visiblePart = this.apiKey.slice(-4);
        return `****${visiblePart}`;
    }
    /**
     * Update configuration
     */
    updateConfig(config) {
        if (config.apiKey)
            this.apiKey = config.apiKey;
        if (config.baseUrl)
            this.baseUrl = config.baseUrl;
        if (config.timeout !== undefined)
            this.timeout = config.timeout;
        if (config.retries !== undefined)
            this.retries = config.retries;
        if (config.retryDelay !== undefined)
            this.retryDelay = config.retryDelay;
        if (config.debug !== undefined)
            this.debug = config.debug;
    }
    /**
     * Test API connection
     */
    async testConnection() {
        try {
            return await this.responses("openai:gpt-3.5-turbo", "Hello", 5);
        }
        catch (error) {
            return this.createErrorResponse(error);
        }
    }
    /**
     * Health check method
     */
    async healthCheck() {
        const testResult = await this.testConnection();
        return {
            status: testResult.error ? "unhealthy" : "healthy",
            timestamp: new Date().toISOString(),
            config: this.getConfig(),
        };
    }
}
exports.ExnestAI = ExnestAI;
//# sourceMappingURL=client.services.js.map