"use strict";
/**
 * ExnestAI Wrapper Service
 * Simple wrapper class following the FazzaAI pattern for basic AI interactions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExnestAI = void 0;
class ExnestAI {
    constructor(apiKey, baseUrl = process.env.EXNEST_API_URL || "https://api.exnest.app/v1") {
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
            const response = await fetch(`${this.baseUrl}/completions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });
            const result = await response.json();
            return result;
        }
        catch (error) {
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
    async response(model, input, maxTokens) {
        return this.chat(model, [{ role: "user", content: input }], maxTokens);
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
exports.ExnestAI = ExnestAI;
//# sourceMappingURL=wrapper.services.js.map