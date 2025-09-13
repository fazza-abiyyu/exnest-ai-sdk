/**
 * ExnestAI Services Index
 * Central export point for all ExnestAI client services
 */

// Main client services
export { ExnestAI as ExnestWrapper } from "./wrapper.services";
export { ExnestAI as ExnestClient } from "./client.services";

// Re-export types for convenience
export type { ExnestMessage } from "./wrapper.services";
export type { 
    ExnestClientOptions, 
    ExnestChatOptions, 
    ExnestResponse,
    ExnestErrorResponse 
} from "./client.services";

/**
 * Default export: Advanced client for most use cases
 */
export { ExnestAI } from "./client.services";