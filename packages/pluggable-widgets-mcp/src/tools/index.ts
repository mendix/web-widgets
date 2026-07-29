import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerBuildTools } from "./build.tools";
import { registerFileOperationTools } from "./file-operations.tools";
import { registerProjectTools } from "./project.tools";
import { registerScaffoldingTools } from "./scaffolding.tools";
import type { SessionState } from "./session-state";
import { registerWidgetPropertiesTools } from "./widget-properties.tools";

/**
 * Registers every tool, in the order a widget is actually built:
 *
 *   project config -> scaffold -> properties (XML) -> component source -> build -> deploy
 *
 * Only tools that resolve a path against the sandbox or spawn a process need `state`; the rest
 * operate on a caller-supplied widget directory already fenced by `validateFilePath`.
 */
export function registerAllTools(server: McpServer, state: SessionState): void {
    registerProjectTools(server, state);
    registerScaffoldingTools(server, state);
    registerWidgetPropertiesTools(server);
    registerFileOperationTools(server);
    registerBuildTools(server, state);
}
