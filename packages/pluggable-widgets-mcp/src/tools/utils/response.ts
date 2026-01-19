import type { ToolResponse } from "@/tools/types";

/**
 * Error codes for structured error responses.
 * These help clients categorize and handle errors appropriately.
 */
export type ErrorCode =
    | "ERR_BUILD_TS" // TypeScript compilation error
    | "ERR_BUILD_XML" // XML validation error
    | "ERR_BUILD_MISSING_DEP" // Missing dependency
    | "ERR_BUILD_UNKNOWN" // Unknown build error
    | "ERR_SCAFFOLD_TIMEOUT" // Scaffolding timed out
    | "ERR_SCAFFOLD_PROMPT" // Generator prompt mismatch
    | "ERR_SCAFFOLD_FAILED" // Generic scaffold failure
    | "ERR_FILE_PATH" // Invalid file path
    | "ERR_FILE_WRITE" // File write failure
    | "ERR_NOT_FOUND" // Resource not found
    | "ERR_OUTPUT_PATH_REQUIRED" // Output path required (e.g., in Claude Desktop)
    | "ERR_OUTPUT_PATH_INVALID"; // Output path is not accessible

/**
 * Structured error with code, message, and optional details.
 * Provides actionable information for debugging and fixing issues.
 */
export interface StructuredError {
    code: ErrorCode;
    message: string;
    suggestion?: string;
    details?: {
        file?: string;
        line?: number;
        column?: number;
        rawOutput?: string;
    };
}

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

/**
 * Creates a structured error response with code, message, and details.
 * Formats the error for both human readability and machine parsing.
 */
export function createStructuredErrorResponse(error: StructuredError): ToolResponse {
    const lines: string[] = [];

    // Header with error code
    lines.push(`❌ [${error.code}] ${error.message}`);

    // File location if available
    if (error.details?.file) {
        let location = `   📁 File: ${error.details.file}`;
        if (error.details.line) {
            location += `:${error.details.line}`;
            if (error.details.column) {
                location += `:${error.details.column}`;
            }
        }
        lines.push(location);
    }

    // Suggestion for fixing
    if (error.suggestion) {
        lines.push(`   💡 Suggestion: ${error.suggestion}`);
    }

    // Raw output for debugging (truncated)
    if (error.details?.rawOutput) {
        const truncated =
            error.details.rawOutput.length > 500
                ? error.details.rawOutput.slice(0, 500) + "...(truncated)"
                : error.details.rawOutput;
        lines.push(`   📝 Details:\n${truncated}`);
    }

    return {
        content: [{ type: "text", text: lines.join("\n") }]
    };
}

/**
 * Creates a structured error object (for use with createStructuredErrorResponse).
 */
export function createStructuredError(
    code: ErrorCode,
    message: string,
    options?: {
        suggestion?: string;
        file?: string;
        line?: number;
        column?: number;
        rawOutput?: string;
    }
): StructuredError {
    return {
        code,
        message,
        suggestion: options?.suggestion,
        details:
            options?.file || options?.line || options?.rawOutput
                ? {
                      file: options?.file,
                      line: options?.line,
                      column: options?.column,
                      rawOutput: options?.rawOutput
                  }
                : undefined
    };
}
