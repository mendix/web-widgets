import type { ToolResponse } from "@/tools/types";

/**
 * Creates a successful tool response with text content.
 */
export function createToolResponse(text: string): ToolResponse {
    return {
        content: [{ type: "text", text }]
    };
}

/**
 * Creates an error tool response with a message.
 */
export function createErrorResponse(message: string): ToolResponse {
    return {
        content: [{ type: "text", text: message }]
    };
}
