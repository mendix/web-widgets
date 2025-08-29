import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { readFile } from "fs/promises";
import { join, dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { exec as execCallback } from "child_process";
import { promisify } from "util";

import type {
    VerificationResult,
    BuildResult,
    TestResult,
    TranslationResult,
    DiffPreviewResult,
    ApplyChangesResult
} from "./types.js";
import {
    scanPackages,
    inspectWidget,
    determineBuildCommand,
    determineTestCommand,
    formatCommandResult
} from "./helpers.js";
import { Guardrails, withGuardrails } from "./guardrails.js";
import { DiffEngine } from "./diff-engine.js";
import { PropertyEngine } from "./property-engine.js";

const exec = promisify(execCallback);

// Simple inline verification function to avoid ESM/CommonJS compatibility issues
async function verifyWidgetManifest(packagePath: string, packageJson: any): Promise<void> {
    try {
        const packageXmlPath = join(packagePath, "package.xml");
        const packageXmlContent = await readFile(packageXmlPath, "utf-8");

        // Simple regex-based extraction of version from package.xml
        const versionMatch = packageXmlContent.match(/version\s*=\s*["']([^"']+)["']/);
        if (!versionMatch) {
            throw new Error("Could not find version in package.xml");
        }

        const xmlVersion = versionMatch[1];
        const jsonVersion = packageJson.version;

        if (jsonVersion !== xmlVersion) {
            throw new Error(`package.json version (${jsonVersion}) does not match package.xml version (${xmlVersion})`);
        }
    } catch (error) {
        throw new Error(`Verification failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, "../../../");

// Initialize guardrails, diff engine, and property engine
const guardrails = new Guardrails(REPO_ROOT);
const diffEngine = new DiffEngine(REPO_ROOT, guardrails);
const propertyEngine = new PropertyEngine();

async function main(): Promise<void> {
    const server = new McpServer({
        name: "mendix-widgets-copilot",
        version: "0.1.0",
        title: "Mendix Widgets Copilot",
        capabilities: {
            resources: {
                "mendix:repo": {
                    description: "The Mendix Pluggable Widgets repository",
                    icon: "https://www.mendix.com/favicon.ico",
                    url: REPO_ROOT
                }
            },
            tools: {}
        }
    });

    server.registerTool("health", { title: "Health", description: "Health check", inputSchema: {} }, async () => ({
        content: [{ type: "text", text: "ok" }]
    }));

    server.registerTool(
        "version",
        { title: "Version", description: "Echo version and repo", inputSchema: { repoPath: z.string().optional() } },
        async ({ repoPath }: { repoPath?: string }) => ({
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        name: "mendix-widgets-copilot",
                        version: "0.1.0",
                        repoPath: repoPath ?? null
                    })
                }
            ]
        })
    );

    server.registerTool(
        "list_packages",
        {
            title: "List Packages",
            description: "List all widget and module packages in the repo with metadata",
            inputSchema: {
                kind: z
                    .enum(["pluggableWidget", "customWidget", "module"])
                    .optional()
                    .describe("Filter by package kind")
            }
        },
        async ({ kind }: { kind?: "pluggableWidget" | "customWidget" | "module" }) => {
            const packagesDir = join(REPO_ROOT, "packages");
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
    );

    server.registerTool(
        "inspect_widget",
        {
            title: "Inspect Widget",
            description:
                "Inspect a specific widget package and return detailed information about its structure, manifests, and files",
            inputSchema: {
                packagePath: z.string().describe("Path to the widget package directory")
            }
        },
        withGuardrails(async ({ packagePath }) => {
            const validatedPath = await guardrails.validatePackage(packagePath);
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
    );

    server.registerTool(
        "verify_manifest_versions",
        {
            title: "Verify Manifest Versions",
            description: "Verify that package.json and package.xml versions are in sync for a widget",
            inputSchema: {
                packagePath: z.string().describe("Path to the widget package directory")
            }
        },
        withGuardrails(async ({ packagePath }) => {
            const validatedPath = await guardrails.validatePackage(packagePath);
            const packageJsonPath = join(validatedPath, "package.json");
            const packageJsonContent = await readFile(packageJsonPath, "utf-8");
            const packageJson = JSON.parse(packageJsonContent);

            await verifyWidgetManifest(validatedPath, packageJson);

            const result: VerificationResult = {
                success: true,
                message: "Manifest versions are in sync",
                version: packageJson.version
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
    );

    server.registerTool(
        "build_widget",
        {
            title: "Build Widget",
            description:
                "Build a widget package using the appropriate build script. Optionally specify a destination path for the built MPK file.",
            inputSchema: {
                packagePath: z.string().describe("Path to the widget package directory"),
                destinationPath: z
                    .string()
                    .optional()
                    .describe(
                        "Optional destination path for the built MPK file. If not provided, will prompt for user preference. Leave empty to use default (testProject within widget directory)."
                    ),
                env: z.record(z.string()).optional().describe("Environment variables to set")
            }
        },
        withGuardrails(
            async ({
                packagePath,
                destinationPath,
                env
            }: {
                packagePath: string;
                destinationPath?: string;
                env?: Record<string, string>;
            }) => {
                const validatedPath = await guardrails.validatePackage(packagePath);
                const packageJsonPath = join(validatedPath, "package.json");
                const packageJsonContent = await readFile(packageJsonPath, "utf-8");
                const packageJson = JSON.parse(packageJsonContent);

                const buildCommand = determineBuildCommand(packageJson.scripts || {});
                guardrails.validateCommand(buildCommand, validatedPath);

                // Handle destination path logic
                let buildEnv = { ...env };
                let destinationInfo = "";

                if (destinationPath === undefined) {
                    // Interactive mode - ask user for preference
                    destinationInfo =
                        "\n\n📍 **Destination Path Options:**\n" +
                        "- To copy MPK to a specific location, provide the 'destinationPath' parameter\n" +
                        "- To use the default behavior (builds into testProject within widget), leave destinationPath empty\n" +
                        "- Default behavior is recommended for local development and testing\n\n" +
                        "💡 **Current build**: Using default destination (testProject within widget directory)";
                } else if (destinationPath === "") {
                    // Explicitly requested default behavior
                    destinationInfo = "💡 **Using default destination**: testProject within widget directory";
                } else {
                    // Specific destination provided
                    const validatedDestination = await guardrails.validatePath(destinationPath);
                    buildEnv.MX_PROJECT_PATH = validatedDestination;
                    destinationInfo = `💡 **Custom destination**: ${validatedDestination}`;
                }

                const safeEnv = guardrails.createSafeEnv(buildEnv);

                const { stdout, stderr } = await exec(buildCommand, {
                    cwd: validatedPath,
                    env: safeEnv
                });

                const result: BuildResult = {
                    ...(formatCommandResult(true, buildCommand, stdout, stderr) as BuildResult),
                    destinationPath:
                        destinationPath === "" ? "default (testProject)" : destinationPath || "default (testProject)",
                    destinationInfo
                };

                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result, null, 2) + destinationInfo
                        }
                    ]
                };
            }
        )
    );

    server.registerTool(
        "run_tests",
        {
            title: "Run Tests",
            description: "Run tests for a widget package",
            inputSchema: {
                packagePath: z.string().describe("Path to the widget package directory"),
                kind: z.enum(["unit", "e2e"]).optional().describe("Type of tests to run")
            }
        },
        withGuardrails(async ({ packagePath, kind }) => {
            const validatedPath = await guardrails.validatePackage(packagePath);
            const packageJsonPath = join(validatedPath, "package.json");
            const packageJsonContent = await readFile(packageJsonPath, "utf-8");
            const packageJson = JSON.parse(packageJsonContent);

            const testCommand = determineTestCommand(packageJson.scripts || {}, kind);
            guardrails.validateCommand(testCommand, validatedPath);

            const { stdout, stderr } = await exec(testCommand, {
                cwd: validatedPath,
                env: guardrails.createSafeEnv()
            });

            const result: TestResult = formatCommandResult(true, testCommand, stdout, stderr) as TestResult;

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(result, null, 2)
                    }
                ]
            };
        })
    );

    server.registerTool(
        "create_translation",
        {
            title: "Create Translation",
            description: "Generate translation files for widgets using turbo",
            inputSchema: {
                packageFilter: z.string().optional().describe("Optional package filter for turbo")
            }
        },
        withGuardrails(async ({ packageFilter }) => {
            let command = "turbo run create-translation";
            if (packageFilter) {
                command += ` --filter=${packageFilter}`;
            }

            guardrails.validateCommand(command, REPO_ROOT);

            const { stdout, stderr } = await exec(command, {
                cwd: REPO_ROOT,
                env: guardrails.createSafeEnv()
            });

            const result: TranslationResult = formatCommandResult(true, command, stdout, stderr) as TranslationResult;

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(result, null, 2)
                    }
                ]
            };
        })
    );

    server.registerTool(
        "preview_changes",
        {
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
            }
        },
        withGuardrails(async ({ changes }) => {
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
    );

    server.registerTool(
        "apply_changes",
        {
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
            }
        },
        withGuardrails(async ({ changes, dryRun = true, createBackup = true }) => {
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
    );

    server.registerTool(
        "rollback_changes",
        {
            title: "Rollback Changes",
            description: "Rollback previously applied changes using rollback token",
            inputSchema: {
                rollbackToken: z.string().describe("Rollback token from apply_changes result")
            }
        },
        withGuardrails(async ({ rollbackToken }) => {
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
    );

    server.registerTool(
        "add_property",
        {
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
            }
        },
        withGuardrails(async ({ packagePath, property, preview = true }) => {
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
                const applyResult = await diffEngine.applyChanges(diffResult, { dryRun: false, createBackup: true });

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
                                        : undefined
                                },
                                null,
                                2
                            )
                        }
                    ]
                };
            }
        })
    );

    server.registerTool(
        "rename_property",
        {
            title: "Rename Property",
            description: "Rename a property across all widget files (XML, TypeScript, runtime)",
            inputSchema: {
                packagePath: z.string().describe("Path to the widget package directory"),
                oldKey: z.string().describe("Current property key/name"),
                newKey: z.string().describe("New property key/name"),
                preview: z.boolean().optional().default(true).describe("Whether to preview changes first")
            }
        },
        withGuardrails(async ({ packagePath, oldKey, newKey, preview = true }) => {
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
                const applyResult = await diffEngine.applyChanges(diffResult, { dryRun: false, createBackup: true });

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
                                        : undefined
                                },
                                null,
                                2
                            )
                        }
                    ]
                };
            }
        })
    );

    await server.connect(new StdioServerTransport());
}

main()
    .then(() => {
        console.error("MCP Server started");
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
