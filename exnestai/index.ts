/**
 * ExnestAI Services Index
 * Central export point for all ExnestAI client services
 */

// Main client services
export { ExnestAI as ExnestWrapper } from "./wrapper.services";
export { ExnestAI as ExnestClient } from "./client.services";

// Re-export types for convenience
export type { 
    ExnestMessage, 
    ExnestResponse, 
    ExnestStreamChunk 
} from "./wrapper.services";

export type { 
    ExnestClientOptions, 
    ExnestChatOptions,
    ExnestBaseResponse,
    ExnestChatResponse,
    ExnestCompletionResponse,
    ExnestResponse as ExnestClientResponse,
    ExnestErrorResponse,
    ExnestStreamChunk as ExnestClientStreamChunk,
    ExnestModel
} from "./client.services";

// Example integrations
export {
    exampleSimpleWrapper,
    exampleAdvancedClient,
    exampleStreaming,
    exampleErrorHandling,
    exampleConfigUpdates,
    exampleModelOperations,
    integrateWithController,
    SimpleExnestAI,
    AdvancedExnestAI
} from "./examples";

/**
 * Default export: Advanced client for most use cases
 */
export { ExnestAI } from "./client.services";