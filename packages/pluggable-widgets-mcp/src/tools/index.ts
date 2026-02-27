import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerBuildTools } from "./build.tools";
import { registerCodeGenerationTools } from "./code-generation.tools";
import { registerFileOperationTools } from "./file-operations.tools";
import { registerProjectTools } from "./project.tools";
import { registerPropertyUpdateTools } from "./property-update.tools";
import { registerScaffoldingTools } from "./scaffolding.tools";
import type { SessionState } from "./session-state";

/**
 * Registers all tools with the MCP server.
 *
 * Tools are organized by category:
 * - Scaffolding: Widget creation (create-widget)
 * - File Operations: Read/write widget files (list-widget-files, read-widget-file, write-widget-file)
 * - Build: Widget building and validation (build-widget)
 * - Code Generation: Generate widget XML and TSX (generate-widget-code)
 * - Property Update: Incremental property updates (update-widget-properties)
 * - Project: Project directory config and deployment (get-project-info, set-project-directory, deploy-widget)
 *
 * Each category registers its tools directly with the server, preserving
 * full type safety through the SDK's generic inference.
 */
export function registerAllTools(server: McpServer, state: SessionState): void {
    registerScaffoldingTools(server, state);
    registerFileOperationTools(server);
    registerBuildTools(server, state);
    registerCodeGenerationTools(server);
    registerPropertyUpdateTools(server);
    registerProjectTools(server, state);
}
