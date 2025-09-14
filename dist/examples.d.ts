/**
 * Example usage of ExnestAI services
 * This file demonstrates how to use both wrapper and client services
 */
import { ExnestAI as SimpleExnestAI } from "./wrapper.services";
import { ExnestAI as AdvancedExnestAI } from "./client.services";
export declare function exampleSimpleWrapper(): Promise<void>;
export declare function exampleAdvancedClient(): Promise<void>;
export declare function exampleStreaming(): Promise<void>;
export declare function exampleErrorHandling(): Promise<void>;
export declare function exampleConfigUpdates(): Promise<void>;
export declare function exampleModelOperations(): Promise<void>;
export { SimpleExnestAI, AdvancedExnestAI };
/**
 * Integration with Express.js controller
 * This shows how the services can be integrated into existing controller logic
 */
export declare function integrateWithController(apiKey: string, model: string, messages: any[]): Promise<{
    success: boolean;
    content: string;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
    model: string;
}>;
//# sourceMappingURL=examples.d.ts.map