import { z } from "zod";
import type { ToolDefinition } from "../types.js";
import type { DiffEngine } from "../diff-engine.js";
import type { PropertyEngine } from "../property-engine.js";
import { withGuardrails } from "../guardrails.js";

export interface ToolDependencies {
    repoRoot: string;
    guardrails: any;
    diffEngine: DiffEngine;
    propertyEngine: PropertyEngine;
}

export function getPropertyTools(deps: ToolDependencies): ToolDefinition[] {
    const { guardrails, diffEngine, propertyEngine } = deps;

    return [
        {
            name: "add_property",
            title: "Add Property",
            description: "Add a new property to a widget with full integration across XML, TypeScript, and runtime",
            inputSchema: {
                packagePath: z.string().describe("Path to the widget package directory"),
                property: z
                    .object({
                        key: z.string().describe("Property key/name"),
                        type: z
                            .enum(["text", "boolean", "integer", "enumeration", "expression", "action", "attribute"])
                            .describe("Property type"),
                        caption: z.string().describe("Human-readable caption"),
                        description: z.string().describe("Property description"),
                        defaultValue: z
                            .union([z.string(), z.boolean(), z.number()])
                            .optional()
                            .describe("Default value"),
                        required: z.boolean().optional().describe("Whether the property is required"),
                        enumValues: z
                            .array(z.string())
                            .optional()
                            .describe("Enumeration values (for enumeration type)"),
                        attributeTypes: z.array(z.string()).optional().describe("Attribute types (for attribute type)"),
                        category: z.string().optional().describe("Property group category")
                    })
                    .describe("Property definition"),
                preview: z.boolean().optional().default(true).describe("Whether to preview changes first")
            },
            handler: withGuardrails(async ({ packagePath, property, preview = true }) => {
                const validatedPath = await guardrails.validatePackage(packagePath);
                const result = await propertyEngine.addProperty(validatedPath, property);

                if (!result.success) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(result, null, 2)
                            }
                        ]
                    };
                }

                if (preview) {
                    // Preview the changes
                    const diffResult = await diffEngine.createDiff(result.changes);

                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(
                                    {
                                        success: true,
                                        preview: true,
                                        summary: result.summary,
                                        diff: diffResult.preview,
                                        changes: diffResult.changes.map(c => ({
                                            filePath: c.filePath,
                                            operation: c.operation,
                                            description: c.description
                                        })),
                                        instruction: "Use apply_changes with dryRun=false to apply these changes"
                                    },
                                    null,
                                    2
                                )
                            }
                        ]
                    };
                } else {
                    // Apply the changes directly
                    const diffResult = await diffEngine.createDiff(result.changes);
                    const applyResult = await diffEngine.applyChanges(diffResult, {
                        dryRun: false,
                        createBackup: true
                    });

                    // After applying, regenerate typings via pluggable-widgets-tools
                    const regen = await propertyEngine.regenerateTypings(validatedPath);

                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(
                                    {
                                        success: applyResult.success,
                                        summary: result.summary,
                                        appliedChanges: applyResult.appliedChanges,
                                        errors: applyResult.errors,
                                        rollbackToken: applyResult.rollbackInfo
                                            ? JSON.stringify(applyResult.rollbackInfo)
                                            : undefined,
                                        typingsRegeneration: regen
                                    },
                                    null,
                                    2
                                )
                            }
                        ]
                    };
                }
            })
        },
        {
            name: "rename_property",
            title: "Rename Property",
            description: "Rename a property across all widget files (XML, TypeScript, runtime)",
            inputSchema: {
                packagePath: z.string().describe("Path to the widget package directory"),
                oldKey: z.string().describe("Current property key/name"),
                newKey: z.string().describe("New property key/name"),
                preview: z.boolean().optional().default(true).describe("Whether to preview changes first")
            },
            handler: withGuardrails(async ({ packagePath, oldKey, newKey, preview = true }) => {
                const validatedPath = await guardrails.validatePackage(packagePath);
                const result = await propertyEngine.renameProperty(validatedPath, oldKey, newKey);

                if (!result.success) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(result, null, 2)
                            }
                        ]
                    };
                }

                if (preview) {
                    // Preview the changes
                    const diffResult = await diffEngine.createDiff(result.changes);

                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(
                                    {
                                        success: true,
                                        preview: true,
                                        summary: result.summary,
                                        diff: diffResult.preview,
                                        changes: diffResult.changes.map(c => ({
                                            filePath: c.filePath,
                                            operation: c.operation,
                                            description: c.description
                                        })),
                                        instruction: "Use apply_changes with dryRun=false to apply these changes"
                                    },
                                    null,
                                    2
                                )
                            }
                        ]
                    };
                } else {
                    // Apply the changes directly
                    const diffResult = await diffEngine.createDiff(result.changes);
                    const applyResult = await diffEngine.applyChanges(diffResult, {
                        dryRun: false,
                        createBackup: true
                    });

                    // After applying, regenerate typings via pluggable-widgets-tools
                    const regen = await propertyEngine.regenerateTypings(validatedPath);

                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(
                                    {
                                        success: applyResult.success,
                                        summary: result.summary,
                                        appliedChanges: applyResult.appliedChanges,
                                        errors: applyResult.errors,
                                        rollbackToken: applyResult.rollbackInfo
                                            ? JSON.stringify(applyResult.rollbackInfo)
                                            : undefined,
                                        typingsRegeneration: regen
                                    },
                                    null,
                                    2
                                )
                            }
                        ]
                    };
                }
            })
        }
    ];
}
