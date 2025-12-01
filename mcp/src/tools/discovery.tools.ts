import { z } from "zod";
import { join } from "path";
import type { ToolDefinition } from "../types.js";
import { scanPackages, findWidgetByName, inspectWidget } from "../helpers.js";
import { withGuardrails } from "../guardrails.js";

export interface ToolDependencies {
    repoRoot: string;
    guardrails: any;
}

export function getDiscoveryTools(deps: ToolDependencies): ToolDefinition[] {
    const { repoRoot, guardrails } = deps;

    return [
        {
            name: "list_packages",
            title: "List Packages",
            description: "List all widget and module packages in the repo with metadata",
            inputSchema: {
                kind: z
                    .enum(["pluggableWidget", "customWidget", "module"])
                    .optional()
                    .describe("Filter by package kind")
            },
            handler: async ({ kind }: { kind?: "pluggableWidget" | "customWidget" | "module" }) => {
                const packagesDir = join(repoRoot, "packages");
                const packages = await scanPackages(packagesDir);
                const filtered = kind ? packages.filter(pkg => pkg.kind === kind) : packages;

                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(filtered, null, 2)
                        }
                    ]
                };
            }
        },
        {
            name: "inspect_widget",
            title: "Inspect Widget",
            description:
                "Inspect a specific widget package. Accepts either a full path or widget name (e.g., 'combobox-web' or '@mendix/combobox-web')",
            inputSchema: {
                packagePath: z
                    .string()
                    .describe("Widget name (e.g., 'combobox-web') or full path to the widget package directory")
            },
            handler: withGuardrails(async ({ packagePath }) => {
                let resolvedPath = packagePath;

                // If packagePath doesn't start with / and doesn't look like an absolute path, try to resolve it as a widget name
                const isAbsolutePath = packagePath.startsWith("/") || packagePath.startsWith(repoRoot);

                if (!isAbsolutePath) {
                    const packagesDir = join(repoRoot, "packages");
                    const foundPath = await findWidgetByName(packagesDir, packagePath);

                    if (foundPath) {
                        resolvedPath = foundPath;
                    } else {
                        return {
                            content: [
                                {
                                    type: "text",
                                    text: JSON.stringify(
                                        {
                                            success: false,
                                            error: `Widget '${packagePath}' not found. Try using the full path or check available widgets with list_packages.`,
                                            searchedIn: packagesDir,
                                            repoRoot
                                        },
                                        null,
                                        2
                                    )
                                }
                            ]
                        };
                    }
                }

                const validatedPath = await guardrails.validatePackage(resolvedPath);
                const inspection = await inspectWidget(validatedPath);

                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(inspection, null, 2)
                        }
                    ]
                };
            })
        }
    ];
}
