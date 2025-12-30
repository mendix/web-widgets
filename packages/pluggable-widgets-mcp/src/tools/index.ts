import type { AnyToolDefinition } from "@/tools/types";
import { getFileOperationTools } from "./file-operations.tools";
import { getScaffoldingTools } from "./scaffolding.tools";

/**
 * Gets all tool definitions for registration with the MCP server.
 *
 * Tools are organized by category:
 * - Scaffolding: Widget creation (create-widget)
 * - File Operations: Read/write widget files (list-widget-files, read-widget-file, write-widget-file)
 */
export function getAllTools(): AnyToolDefinition[] {
    const tools: AnyToolDefinition[] = [];

    tools.push(...getScaffoldingTools());
    tools.push(...getFileOperationTools());

    return tools;
}
