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
        const response = await exnest.chat("gpt-4.1-mini", [
            { role: "user", content: "Hello, how are you?" }
        ]);
        
        console.log("Simple wrapper response:", response);
        
        // Simple response method
        const quickResponse = await exnest.response("gemini-2.5-flash", "What is TypeScript?");
        console.log("Quick response:", quickResponse);
        
    } catch (error) {
        console.error("Simple wrapper error:", error);
    }
}

// Example 2: Advanced client usage
export async function exampleAdvancedClient() {
    const exnest = new AdvancedExnestAI({
        apiKey: "your-api-key-here",
        baseUrl: process.env.EXNEST_API_URL || "https://exnest.fazzaabiyyu.xyz/v1",
        timeout: 30000,
        retries: 3,
        debug: true
    });
    
    try {
        // Advanced chat with options
        const response = await exnest.chat(
            "gemini-2.5-flash",
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
        
    } catch (error) {
        console.error("Advanced client error:", error);
    }
}

// Example 3: Error handling
export async function exampleErrorHandling() {
    const exnest = new AdvancedExnestAI({
        apiKey: "invalid-key",
        retries: 2,
        debug: true
    });
    
    try {
        const response = await exnest.responses("gpt-4.1-mini", "Test message");
        
        if (!response.success) {
            console.log("Expected error response:", response.error);
        }
        
    } catch (error) {
        console.error("Caught error:", error);
    }
}

// Example 4: Configuration updates
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