import type { AnyToolDefinition } from "@/tools/types";
import { getScaffoldingTools } from "./scaffolding.tools";

/**
 * Gets all tool definitions for registration with the MCP server.
 */
export function getAllTools(): AnyToolDefinition[] {
    const tools: AnyToolDefinition[] = [];

    tools.push(...getScaffoldingTools());

    return tools;
}
