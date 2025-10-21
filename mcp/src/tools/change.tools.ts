import { z } from "zod";
import type { ToolDefinition, DiffPreviewResult, ApplyChangesResult } from "../types.js";
import type { DiffEngine } from "../diff-engine.js";
import { withGuardrails } from "../guardrails.js";

export interface ToolDependencies {
    repoRoot: string;
    guardrails: any;
    diffEngine: DiffEngine;
}

export function getChangeTools(deps: ToolDependencies): ToolDefinition[] {
    const { diffEngine } = deps;

    return [
        {
            name: "preview_changes",
            title: "Preview Changes",
            description: "Preview file changes with diff before applying them",
            inputSchema: {
                changes: z
                    .array(
                        z.object({
                            filePath: z.string().describe("Path to the file to change"),
                            newContent: z.string().describe("New content for the file"),
                            operation: z.enum(["create", "update", "delete"]).describe("Type of operation"),
                            description: z.string().describe("Description of the change")
                        })
                    )
                    .describe("Array of changes to preview")
            },
            handler: withGuardrails(async ({ changes }) => {
                const diffResult = await diffEngine.createDiff(changes);

                const result: DiffPreviewResult = {
                    success: true,
                    preview: diffResult.preview,
                    summary: diffResult.summary,
                    changes: diffResult.changes.map(c => ({
                        filePath: c.filePath,
                        operation: c.operation,
                        description: c.description
                    }))
                };

                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result, null, 2)
                        }
                    ]
                };
            })
        },
        {
            name: "apply_changes",
            title: "Apply Changes",
            description: "Apply previewed changes to files (supports dry-run mode)",
            inputSchema: {
                changes: z
                    .array(
                        z.object({
                            filePath: z.string().describe("Path to the file to change"),
                            newContent: z.string().describe("New content for the file"),
                            operation: z.enum(["create", "update", "delete"]).describe("Type of operation"),
                            description: z.string().describe("Description of the change")
                        })
                    )
                    .describe("Array of changes to apply"),
                dryRun: z.boolean().optional().default(true).describe("Whether to run in dry-run mode (default: true)"),
                createBackup: z.boolean().optional().default(true).describe("Whether to create backups for rollback")
            },
            handler: withGuardrails(async ({ changes, dryRun = true, createBackup = true }) => {
                const diffResult = await diffEngine.createDiff(changes);
                const applyResult = await diffEngine.applyChanges(diffResult, { dryRun, createBackup });

                const result: ApplyChangesResult = {
                    success: applyResult.success,
                    appliedChanges: applyResult.appliedChanges,
                    errors: applyResult.errors,
                    rollbackToken: applyResult.rollbackInfo ? JSON.stringify(applyResult.rollbackInfo) : undefined,
                    dryRun
                };

                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result, null, 2)
                        }
                    ]
                };
            })
        },
        {
            name: "rollback_changes",
            title: "Rollback Changes",
            description: "Rollback previously applied changes using rollback token",
            inputSchema: {
                rollbackToken: z.string().describe("Rollback token from apply_changes result")
            },
            handler: withGuardrails(async ({ rollbackToken }) => {
                const rollbackInfo = JSON.parse(rollbackToken);
                const rollbackResult = await diffEngine.rollbackChanges(rollbackInfo);

                const result: ApplyChangesResult = {
                    success: rollbackResult.success,
                    appliedChanges: rollbackResult.appliedChanges,
                    errors: rollbackResult.errors
                };

                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result, null, 2)
                        }
                    ]
                };
            })
        }
    ];
}
