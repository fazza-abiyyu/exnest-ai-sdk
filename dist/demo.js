"use strict";
/**
 * Demo script for ExnestAI SDK
 * This script demonstrates the key features of the updated SDK
 */
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
async function demo() {
    // Initialize the client
    const exnest = new index_1.ExnestAI({
        apiKey: "your-api-key-here",
        baseUrl: "https://api.exnest.app/v1",
        timeout: 30000,
        retries: 3,
        debug: true
    });
    console.log("=== ExnestAI SDK Demo ===\n");
    // 1. Text completion (single prompt)
    console.log("1. Text Completion:");
    try {
        const response = await exnest.completion("openai:gpt-4o-mini", "What is the capital of France?", {
            maxTokens: 100,
            exnestMetadata: true
        });
        if (response.error) {
            console.log("Error:", response.error.message);
        }
        else {
            console.log("Response:", response.choices?.[0]?.text);
            console.log("Tokens used:", response.usage);
            if (response.exnest?.billing) {
                console.log("Cost:", response.exnest.billing.actual_cost_usd, "USD");
            }
        }
    }
    catch (error) {
        console.error("Completion error:", error);
    }
    console.log("\n" + "=".repeat(50) + "\n");
    // 2. Chat completion (messages array)
    console.log("2. Chat Completion:");
    try {
        const response = await exnest.chat("openai:gpt-4o-mini", [
            { role: "user", content: "Hello! What can you tell me about ExnestAI?" }
        ]);
        if (response.error) {
            console.log("Error:", response.error.message);
        }
        else {
            console.log("Response:", response.choices?.[0]?.message?.content);
            console.log("Tokens used:", response.usage);
        }
    }
    catch (error) {
        console.error("Chat error:", error);
    }
    console.log("\n" + "=".repeat(50) + "\n");
    // 3. Streaming text completion
    console.log("3. Streaming Text Completion:");
    try {
        console.log("Streaming single prompt:");
        for await (const chunk of exnest.streamCompletion("openai:gpt-4o-mini", "Write a short poem about programming.", {
            maxTokens: 100
        })) {
            if (chunk.choices[0]?.delta?.content) {
                process.stdout.write(chunk.choices[0].delta.content);
            }
        }
        console.log("\n");
    }
    catch (error) {
        console.error("Streaming error:", error);
    }
    console.log("\n" + "=".repeat(50) + "\n");
    // 4. Streaming chat completion
    console.log("4. Streaming Chat Completion:");
    try {
        console.log("Streaming messages:");
        for await (const chunk of exnest.stream("openai:gpt-4o-mini", [
            { role: "user", content: "Tell me a fun fact about computers." }
        ], {
            maxTokens: 100
        })) {
            if (chunk.choices[0]?.delta?.content) {
                process.stdout.write(chunk.choices[0].delta.content);
            }
        }
        console.log("\nStreaming completed!");
    }
    catch (error) {
        console.error("Streaming error:", error);
    }
    console.log("\n" + "=".repeat(50) + "\n");
    // 5. Get available models
    console.log("5. Available Models:");
    try {
        const modelsResponse = await exnest.getModels();
        if (modelsResponse.error) {
            console.log("Error fetching models:", modelsResponse.error.message);
        }
        else {
            console.log("Total models available:", modelsResponse.choices?.length || "N/A");
            console.log("Models response received successfully");
        }
    }
    catch (error) {
        console.error("Models error:", error);
    }
    console.log("\n" + "=".repeat(50) + "\n");
    // 6. OpenAI-compatible with Exnest metadata
    console.log("6. OpenAI-Compatible with Billing Metadata:");
    try {
        const response = await exnest.chat("openai:gpt-4o-mini", [
            { role: "user", content: "Explain what OpenAI compatibility means" }
        ], {
            exnestMetadata: true, // Get billing info
            temperature: 0.7,
            maxTokens: 150
        });
        if (response.error) {
            console.log("Error:", response.error.message);
        }
        else {
            console.log("OpenAI-compatible response format:");
            console.log("Model:", response.model);
            console.log("Content:", response.choices?.[0]?.message?.content);
            if (response.exnest?.billing) {
                console.log("Billing Info:");
                console.log("  Transaction ID:", response.exnest.billing.transaction_id);
                console.log("  Cost:", response.exnest.billing.actual_cost_usd, "USD");
            }
        }
    }
    catch (error) {
        console.error("Response error:", error);
    }
    console.log("\n=== Demo Complete ===");
}
// Run the demo
demo().catch(console.error);
//# sourceMappingURL=demo.js.map