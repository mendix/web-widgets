import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerBuildTools } from "./build.tools";
import { registerCodeGenerationTools } from "./code-generation.tools";
import { registerFileOperationTools } from "./file-operations.tools";
import { registerScaffoldingTools } from "./scaffolding.tools";

/**
 * Registers all tools with the MCP server.
 *
 * Tools are organized by category:
 * - Scaffolding: Widget creation (create-widget)
 * - File Operations: Read/write widget files (list-widget-files, read-widget-file, write-widget-file, batch-write-widget-files)
 * - Build: Widget building and validation (build-widget)
 * - Code Generation: Generate widget XML and TSX (generate-widget-code)
 *
 * Each category registers its tools directly with the server, preserving
 * full type safety through the SDK's generic inference.
 */
export function registerAllTools(server: McpServer): void {
    registerScaffoldingTools(server);
    registerFileOperationTools(server);
    registerBuildTools(server);
    registerCodeGenerationTools(server);
}
