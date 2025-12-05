import type { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import type { ServerNotification, ServerRequest } from "@modelcontextprotocol/sdk/types.js";
import type { ZodType } from "zod";

// =============================================================================
// MCP Core Types
// =============================================================================

/**
 * Standard response format for MCP tool handlers.
 * Index signature required for MCP SDK compatibility.
 */
export interface ToolResponse {
    [key: string]: unknown;
    content: Array<{ type: "text"; text: string }>;
}

/**
 * Extra context provided to tool handlers by the MCP server.
 */
export type ToolContext = RequestHandlerExtra<ServerRequest, ServerNotification>;

/**
 * Type for tool handler functions.
 */
export type ToolHandler<T = unknown> = (args: T, context: ToolContext) => Promise<ToolResponse>;

/**
 * Definition for an MCP tool.
 */
export interface ToolDefinition<T = unknown> {
    name: string;
    title: string;
    description: string;
    inputSchema: ZodType<T>;
    handler: ToolHandler<T>;
}

/**
 * Type for collections of tools with heterogeneous input types.
 * Uses 'any' because TypeScript's variance rules prevent using 'unknown'
 * for handlers that only accept specific input types.
 */
export type AnyToolDefinition = ToolDefinition<any>;

/**
 * Log levels supported by MCP logging notifications.
 */
export type LogLevel = "debug" | "info" | "notice" | "warning" | "error";

// =============================================================================
// Widget Generator Types
// =============================================================================

/**
 * Options for creating a new Mendix pluggable widget.
 */
export interface WidgetOptions {
    name: string;
    description: string;
    version: string;
    author: string;
    license: string;
    organization?: string;
    template?: "full" | "empty";
    programmingLanguage?: "typescript" | "javascript";
    unitTests?: boolean;
    e2eTests?: boolean;
}
