import type { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import type { ServerNotification, ServerRequest } from "@modelcontextprotocol/sdk/types.js";
import { z, type ZodType } from "zod";

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
 * Default values for widget options.
 * Centralized here to be used by both schema descriptions and buildWidgetOptions().
 */
export const DEFAULT_WIDGET_OPTIONS = {
    version: "1.0.0",
    author: "Mendix",
    license: "Apache-2.0",
    organization: "Mendix",
    template: "empty" as const,
    programmingLanguage: "typescript" as const,
    unitTests: true,
    e2eTests: false
} as const;

/**
 * Zod schema for widget creation options.
 * Single source of truth for widget options - type is derived via z.infer.
 */
export const widgetOptionsSchema = z.object({
    name: z
        .string()
        .min(1)
        .max(100)
        .describe("[REQUIRED] The name of the widget in PascalCase (e.g., 'MyAwesomeWidget', 'DataChart')"),
    description: z.string().min(1).max(200).describe("[REQUIRED] A brief description of what the widget does"),
    version: z
        .string()
        .regex(/^\d+\.\d+\.\d+$/, "Version must be in semver format: x.y.z")
        .optional()
        .describe(`[OPTIONAL] Initial version in semver format. Default: "${DEFAULT_WIDGET_OPTIONS.version}"`),
    author: z
        .string()
        .min(1)
        .max(100)
        .optional()
        .describe(`[OPTIONAL] Author name. Default: "${DEFAULT_WIDGET_OPTIONS.author}"`),
    license: z
        .string()
        .min(1)
        .max(50)
        .optional()
        .describe(`[OPTIONAL] License type. Default: "${DEFAULT_WIDGET_OPTIONS.license}"`),
    organization: z
        .string()
        .min(1)
        .max(100)
        .optional()
        .describe(
            `[OPTIONAL] Organization name for the widget namespace. Default: "${DEFAULT_WIDGET_OPTIONS.organization}"`
        ),
    template: z
        .enum(["full", "empty"])
        .optional()
        .describe(
            `[OPTIONAL] Widget template: "full" includes sample code and examples, "empty" is minimal/blank. Default: "${DEFAULT_WIDGET_OPTIONS.template}"`
        ),
    programmingLanguage: z
        .enum(["typescript", "javascript"])
        .optional()
        .describe(
            `[OPTIONAL] Programming language for the widget source code. Default: "${DEFAULT_WIDGET_OPTIONS.programmingLanguage}"`
        ),
    unitTests: z
        .boolean()
        .optional()
        .describe(`[OPTIONAL] Include unit test setup with Jest. Default: ${DEFAULT_WIDGET_OPTIONS.unitTests}`),
    e2eTests: z
        .boolean()
        .optional()
        .describe(
            `[OPTIONAL] Include end-to-end test setup with Playwright. Default: ${DEFAULT_WIDGET_OPTIONS.e2eTests}`
        )
});

/**
 * Input options for creating a new Mendix pluggable widget (with optional fields).
 * Derived from widgetOptionsSchema to ensure type-schema consistency.
 */
export type WidgetOptionsInput = z.infer<typeof widgetOptionsSchema>;

/**
 * Resolved widget options with all defaults applied (all fields required).
 * This is the type returned by buildWidgetOptions() after applying defaults.
 */
export interface WidgetOptions {
    name: string;
    description: string;
    version: string;
    author: string;
    license: string;
    organization: string;
    template: "full" | "empty";
    programmingLanguage: "typescript" | "javascript";
    unitTests: boolean;
    e2eTests: boolean;
}
