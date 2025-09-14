/**
 * Demo script for ExnestAI SDK
 * This script demonstrates the key features of the updated SDK
 */
import { ExnestAI } from "./index";
async function demo() {
    // Initialize the client
    const exnest = new ExnestAI({
        apiKey: "your-api-key-here",
        baseUrl: "https://api.exnest.app/v1",
        timeout: 30000,
        retries: 3,
        debug: true
    });
    console.log("=== ExnestAI SDK Demo ===\n");
    // 1. Simple chat completion
    console.log("1. Simple Chat Completion:");
    try {
        const response = await exnest.chat("openai:gpt-4o-mini", [
            { role: "user", content: "Hello! What can you tell me about ExnestAI?" }
        ]);
        if (response.success) {
            console.log("Response:", response.data?.choices[0].message.content);
            console.log("Tokens used:", response.data?.usage);
        }
        else {
            console.log("Error:", response.message);
        }
    }
    catch (error) {
        console.error("Chat error:", error);
    }
    console.log("\n" + "=".repeat(50) + "\n");
    // 2. Streaming response
    console.log("2. Streaming Response:");
    try {
        console.log("Streaming response (this may take a moment):");
        for await (const chunk of exnest.stream("openai:gpt-4o-mini", [
            { role: "user", content: "Write a short poem about programming." }
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
    // 3. Get available models
    console.log("3. Available Models:");
    try {
        const modelsResponse = await exnest.getModels();
        if (modelsResponse.success) {
            // For the models endpoint, the data structure is different
            // We need to check the actual response structure
            console.log("Models response received successfully");
        }
        else {
            console.log("Error fetching models:", modelsResponse.message);
        }
    }
    catch (error) {
        console.error("Models error:", error);
    }
    console.log("\n" + "=".repeat(50) + "\n");
    // 4. OpenAI-compatible mode
    console.log("4. OpenAI-Compatible Mode:");
    try {
        const openaiResponse = await exnest.chat("openai:gpt-4o-mini", [
            { role: "user", content: "What is the capital of France?" }
        ], {
            openaiCompatible: true,
            temperature: 0.7
        });
        if (openaiResponse.success) {
            console.log("OpenAI-compatible response format:");
            console.log("Model:", openaiResponse.data?.model);
            console.log("Content:", openaiResponse.data?.choices[0].message.content);
        }
        else {
            console.log("Error:", openaiResponse.message);
        }
    }
    catch (error) {
        console.error("OpenAI-compatible error:", error);
    }
    console.log("\n=== Demo Complete ===");
}
// Run the demo
demo().catch(console.error);
//# sourceMappingURL=demo.js.map