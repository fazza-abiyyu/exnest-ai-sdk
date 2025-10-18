"use strict";
/**
 * Example usage of ExnestAI services
 * This file demonstrates how to use both wrapper and client services
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvancedExnestAI = exports.SimpleExnestAI = void 0;
exports.exampleSimpleWrapper = exampleSimpleWrapper;
exports.exampleAdvancedClient = exampleAdvancedClient;
exports.exampleStreaming = exampleStreaming;
exports.exampleErrorHandling = exampleErrorHandling;
exports.exampleConfigUpdates = exampleConfigUpdates;
exports.exampleModelOperations = exampleModelOperations;
exports.integrateWithController = integrateWithController;
const wrapper_services_1 = require("./wrapper.services");
Object.defineProperty(exports, "SimpleExnestAI", { enumerable: true, get: function () { return wrapper_services_1.ExnestAI; } });
const client_services_1 = require("./client.services");
Object.defineProperty(exports, "AdvancedExnestAI", { enumerable: true, get: function () { return client_services_1.ExnestAI; } });
// Example 1: Simple wrapper usage
async function exampleSimpleWrapper() {
    const exnest = new wrapper_services_1.ExnestAI("your-api-key-here");
    try {
        // Text completion with single prompt
        const completionResponse = await exnest.completion("openai:gpt-4o-mini", "What is the capital of France?", 500 // maxTokens
        );
        console.log("Completion response:", completionResponse.choices?.[0]?.text);
        // Chat completion with messages
        const chatResponse = await exnest.chat("openai:gpt-4o-mini", [
            { role: "user", content: "Hello, how are you?" }
        ]);
        console.log("Chat response:", chatResponse.choices?.[0]?.message?.content);
        // Simple response method (legacy)
        const quickResponse = await exnest.response("google:gemini-2.0-flash-exp", "What is TypeScript?");
        console.log("Quick response:", quickResponse);
        // Get models
        const models = await exnest.getModels();
        console.log("Available models:", models);
    }
    catch (error) {
        console.error("Simple wrapper error:", error);
    }
}
// Example 2: Advanced client usage
async function exampleAdvancedClient() {
    const exnest = new client_services_1.ExnestAI({
        apiKey: "your-api-key-here",
        baseUrl: process.env.EXNEST_API_URL || "https://api.exnest.app/v1",
        timeout: 30000,
        retries: 3,
        debug: true
    });
    try {
        // Text completion with options
        const completionResponse = await exnest.completion("openai:gpt-4o-mini", "Explain the concept of closures in JavaScript", {
            temperature: 0.7,
            maxTokens: 500,
            timeout: 15000,
            exnestMetadata: true // Enable billing metadata
        });
        console.log("Completion:", completionResponse.choices?.[0]?.text);
        if (completionResponse.exnest?.billing) {
            console.log("Billing info:", completionResponse.exnest.billing);
        }
        // Advanced chat with options
        const chatResponse = await exnest.chat("google:gemini-2.0-flash-exp", [
            { role: "system", content: "You are a helpful programming assistant." },
            { role: "user", content: "Explain async/await in JavaScript" }
        ], {
            temperature: 0.7,
            maxTokens: 500,
            timeout: 15000,
            exnestMetadata: true // Enable billing metadata
        });
        console.log("Chat response:", chatResponse.choices?.[0]?.message?.content);
        // Health check
        const health = await exnest.healthCheck();
        console.log("Health check:", health);
        // Get configuration
        const config = exnest.getConfig();
        console.log("Client config:", config);
        // Get all models (OpenAI-compatible by default)
        const models = await exnest.getModels();
        console.log("Available models:", models);
    }
    catch (error) {
        console.error("Advanced client error:", error);
    }
}
// Example 3: Streaming usage
async function exampleStreaming() {
    const exnest = new client_services_1.ExnestAI({
        apiKey: "your-api-key-here",
        debug: true
    });
    try {
        console.log("Starting text completion streaming...");
        // Stream text completion (single prompt)
        for await (const chunk of exnest.streamCompletion("openai:gpt-4o-mini", "Write a short story about a robot learning to paint.", {
            maxTokens: 300
        })) {
            if (chunk.choices[0]?.delta?.content) {
                process.stdout.write(chunk.choices[0].delta.content);
            }
        }
        console.log("\n\nStarting chat completion streaming...");
        // Stream chat completion (messages array)
        for await (const chunk of exnest.stream("openai:gpt-4o-mini", [
            { role: "user", content: "Write a poem about the ocean." }
        ], {
            maxTokens: 200
        })) {
            if (chunk.choices[0]?.delta?.content) {
                process.stdout.write(chunk.choices[0].delta.content);
            }
        }
        console.log("\nStreaming completed.");
    }
    catch (error) {
        console.error("Streaming error:", error);
    }
}
// Example 4: Error handling
async function exampleErrorHandling() {
    const exnest = new client_services_1.ExnestAI({
        apiKey: "invalid-key",
        retries: 2,
        debug: true
    });
    try {
        const response = await exnest.chat("openai:gpt-4o-mini", [{ role: "user", content: "Test message" }]);
        // Check for OpenAI-compatible error format
        if (response.error) {
            console.log("Expected error response:", response.error);
            if (response.error.exnest?.transaction_refunded) {
                console.log("Transaction was refunded");
            }
        }
        else {
            console.log("Response:", response.choices?.[0]?.message?.content);
        }
    }
    catch (error) {
        console.error("Caught error:", error);
    }
}
// Example 5: Configuration updates
async function exampleConfigUpdates() {
    const exnest = new client_services_1.ExnestAI({
        apiKey: "initial-key",
        debug: false
    });
    console.log("Initial config:", exnest.getConfig());
    // Update configuration
    exnest.updateConfig({
        debug: true,
        timeout: 60000,
        retries: 5
    });
    console.log("Updated config:", exnest.getConfig());
}
// Example 6: Model operations
async function exampleModelOperations() {
    const exnest = new client_services_1.ExnestAI({
        apiKey: "your-api-key-here",
        debug: true
    });
    try {
        // Get all models
        const allModels = await exnest.getModels();
        console.log("All models:", allModels);
        // Get models for a specific provider
        const openaiModels = await exnest.getModelsByProvider("openai");
        console.log("OpenAI models:", openaiModels);
        // Get a specific model
        const specificModel = await exnest.getModel("gpt-4o-mini");
        console.log("Specific model:", specificModel);
    }
    catch (error) {
        console.error("Model operations error:", error);
    }
}
/**
 * Integration with Express.js controller
 * This shows how the services can be integrated into existing controller logic
 */
async function integrateWithController(apiKey, model, messages) {
    const exnest = new client_services_1.ExnestAI({
        apiKey,
        timeout: 30000,
        retries: 2,
        debug: process.env.NODE_ENV === "development"
    });
    try {
        const result = await exnest.chat(model, messages, {
            temperature: 0.7,
            maxTokens: 2048,
            exnestMetadata: true // Get billing info
        });
        // OpenAI-compatible response format
        if (result.error) {
            throw new Error(result.error.message || "API request failed");
        }
        return {
            success: true,
            content: result.choices?.[0]?.message?.content || "",
            usage: result.usage,
            model: result.model,
            billing: result.exnest?.billing // Optional billing metadata
        };
    }
    catch (error) {
        throw new Error(`Chat completion failed: ${error.message}`);
    }
}
//# sourceMappingURL=examples.js.map