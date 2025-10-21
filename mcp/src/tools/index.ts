import type { ToolDefinition } from "../types.js";
import type { Guardrails } from "../guardrails.js";
import type { DiffEngine } from "../diff-engine.js";
import type { PropertyEngine } from "../property-engine.js";
import { getUtilityTools } from "./utility.tools.js";
import { getDiscoveryTools } from "./discovery.tools.js";
import { getBuildTools } from "./build.tools.js";
import { getChangeTools } from "./change.tools.js";
import { getPropertyTools } from "./property.tools.js";

export interface ToolDependencies {
    repoRoot: string;
    guardrails: Guardrails;
    diffEngine: DiffEngine;
    propertyEngine: PropertyEngine;
}

/**
 * Get all tool definitions for registration with the MCP server
 */
export function getAllTools(deps: ToolDependencies): ToolDefinition[] {
    const tools: ToolDefinition[] = [];

    // Add utility tools
    tools.push(...getUtilityTools({ repoRoot: deps.repoRoot }));

    // Add discovery tools
    tools.push(...getDiscoveryTools({ repoRoot: deps.repoRoot, guardrails: deps.guardrails }));

    // Add build tools
    tools.push(...getBuildTools({ repoRoot: deps.repoRoot, guardrails: deps.guardrails }));

    // Add change management tools
    tools.push(
        ...getChangeTools({
            repoRoot: deps.repoRoot,
            guardrails: deps.guardrails,
            diffEngine: deps.diffEngine
        })
    );

    // Add property management tools
    tools.push(
        ...getPropertyTools({
            repoRoot: deps.repoRoot,
            guardrails: deps.guardrails,
            diffEngine: deps.diffEngine,
            propertyEngine: deps.propertyEngine
        })
    );

    return tools;
}
