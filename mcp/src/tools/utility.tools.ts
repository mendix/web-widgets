import { z } from "zod";
import type { ToolDefinition } from "../types.js";

export interface ToolDependencies {
    repoRoot: string;
}

export function getUtilityTools(_deps: ToolDependencies): ToolDefinition[] {
    return [
        {
            name: "health",
            title: "Health",
            description: "Health check",
            inputSchema: {},
            handler: async () => ({
                content: [{ type: "text", text: "ok" }]
            })
        },
        {
            name: "version",
            title: "Version",
            description: "Echo version and repo",
            inputSchema: { repoPath: z.string().optional() },
            handler: async ({ repoPath }: { repoPath?: string }) => ({
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            name: "mendix-pluggable-mcp",
                            version: "0.1.0",
                            repoPath: repoPath ?? null
                        })
                    }
                ]
            })
        }
    ];
}
