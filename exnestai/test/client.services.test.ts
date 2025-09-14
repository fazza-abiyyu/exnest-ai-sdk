import { describe, it, expect } from "bun:test";
import { ExnestAI } from "../client.services";

describe("ExnestAI Client Services", () => {
  it("should create an instance with API key", () => {
    const apiKey = "test-api-key";
    const client = new ExnestAI({ apiKey });
    
    expect(client).toBeInstanceOf(ExnestAI);
    expect(client.getApiKeyInfo()).toBe("****-key");
  });

  it("should update configuration", () => {
    const client = new ExnestAI({ apiKey: "test-key" });
    const initialConfig = client.getConfig();
    
    client.updateConfig({ timeout: 5000, debug: true });
    const updatedConfig = client.getConfig();
    
    expect(updatedConfig.timeout).toBe(5000);
    expect(updatedConfig.debug).toBe(true);
    expect(updatedConfig.baseUrl).toBe(initialConfig.baseUrl);
  });

  it("should validate inputs correctly", async () => {
    const client = new ExnestAI({ apiKey: "test-key" });
    
    // Test invalid model
    try {
      await client.chat("", [{ role: "user", content: "Hello" }]);
      expect(true).toBe(false); // Should not reach here
    } catch (error: any) {
      expect(error.message).toBe("Model must be a non-empty string");
    }
    
    // Test invalid messages
    try {
      await client.chat("openai:gpt-4", []);
      expect(true).toBe(false); // Should not reach here
    } catch (error: any) {
      expect(error.message).toBe("Messages must be a non-empty array");
    }
    
    // Test invalid message role
    try {
      await client.chat("openai:gpt-4", [{ role: "invalid" as any, content: "Hello" }]);
      expect(true).toBe(false); // Should not reach here
    } catch (error: any) {
      expect(error.message).toBe("Each message must have a valid role (system, user, or assistant)");
    }
  });
});