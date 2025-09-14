/**
 * Example usage of ExnestAI services
 * This file demonstrates how to use both wrapper and client services
 */

import { ExnestAI as SimpleExnestAI } from "./wrapper.services";
import { ExnestAI as AdvancedExnestAI } from "./client.services";

// Example 1: Simple wrapper usage
export async function exampleSimpleWrapper() {
    const exnest = new SimpleExnestAI("your-api-key-here");
    
    try {
        // Simple chat
        const response = await exnest.chat("openai:gpt-4o-mini", [
            { role: "user", content: "Hello, how are you?" }
        ]);
        
        console.log("Simple wrapper response:", response);
        
        // Simple response method
        const quickResponse = await exnest.response("google:gemini-2.0-flash-exp", "What is TypeScript?");
        console.log("Quick response:", quickResponse);
        
        // Get models
        const models = await exnest.getModels();
        console.log("Available models:", models);
        
    } catch (error) {
        console.error("Simple wrapper error:", error);
    }
}

// Example 2: Advanced client usage
export async function exampleAdvancedClient() {
    const exnest = new AdvancedExnestAI({
        apiKey: "your-api-key-here",
        baseUrl: process.env.EXNEST_API_URL || "https://api.exnest.app/v1",
        timeout: 30000,
        retries: 3,
        debug: true
    });
    
    try {
        // Advanced chat with options
        const response = await exnest.chat(
            "google:gemini-2.0-flash-exp",
            [
                { role: "system", content: "You are a helpful programming assistant." },
                { role: "user", content: "Explain async/await in JavaScript" }
            ],
            {
                temperature: 0.7,
                maxTokens: 500,
                timeout: 15000
            }
        );
        
        console.log("Advanced client response:", response);
        
        // Health check
        const health = await exnest.healthCheck();
        console.log("Health check:", health);
        
        // Get configuration
        const config = exnest.getConfig();
        console.log("Client config:", config);
        
        // Get models with OpenAI compatibility
        const models = await exnest.getModels({ openaiCompatible: true });
        console.log("OpenAI-compatible models:", models);
        
    } catch (error) {
        console.error("Advanced client error:", error);
    }
}

// Example 3: Streaming usage
export async function exampleStreaming() {
    const exnest = new AdvancedExnestAI({
        apiKey: "your-api-key-here",
        debug: true
    });
    
    try {
        console.log("Starting streaming response...");
        
        // Stream response
        for await (const chunk of exnest.stream(
            "openai:gpt-4o-mini",
            [
                { role: "user", content: "Write a short story about a robot learning to paint." }
            ],
            {
                maxTokens: 300
            }
        )) {
            // Print each chunk as it arrives
            if (chunk.choices[0]?.delta?.content) {
                process.stdout.write(chunk.choices[0].delta.content);
            }
        }
        
        console.log("\nStreaming completed.");
        
    } catch (error) {
        console.error("Streaming error:", error);
    }
}

// Example 4: Error handling
export async function exampleErrorHandling() {
    const exnest = new AdvancedExnestAI({
        apiKey: "invalid-key",
        retries: 2,
        debug: true
    });
    
    try {
        const response = await exnest.responses("openai:gpt-4o-mini", "Test message");
        
        if (!response.success) {
            console.log("Expected error response:", response.error);
        }
        
    } catch (error) {
        console.error("Caught error:", error);
    }
}

// Example 5: Configuration updates
export async function exampleConfigUpdates() {
    const exnest = new AdvancedExnestAI({
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
export async function exampleModelOperations() {
    const exnest = new AdvancedExnestAI({
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
        
    } catch (error) {
        console.error("Model operations error:", error);
    }
}

// Export for use in other parts of the application
export { SimpleExnestAI, AdvancedExnestAI };

/**
 * Integration with Express.js controller
 * This shows how the services can be integrated into existing controller logic
 */
export async function integrateWithController(apiKey: string, model: string, messages: any[]) {
    const exnest = new AdvancedExnestAI({
        apiKey,
        timeout: 30000,
        retries: 2,
        debug: process.env.NODE_ENV === "development"
    });
    
    try {
        const result = await exnest.chat(model, messages, {
            temperature: 0.7,
            maxTokens: 2048
        });
        
        if (result.success && result.data) {
            return {
                success: true,
                content: result.data.choices[0]?.message?.content || "",
                usage: result.data.usage,
                model: result.data.model
            };
        } else {
            throw new Error(result.message || "API request failed");
        }
        
    } catch (error: any) {
        throw new Error(`Chat completion failed: ${error.message}`);
    }
}