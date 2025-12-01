import { z } from "zod";
import { join } from "path";
import { readFile } from "fs/promises";
import { exec as execCallback } from "child_process";
import { promisify } from "util";
import type { ToolDefinition, VerificationResult, BuildResult, TestResult, TranslationResult } from "../types.js";
import { findWidgetByName, determineBuildCommand, determineTestCommand, formatCommandResult } from "../helpers.js";
import { withGuardrails } from "../guardrails.js";

const exec = promisify(execCallback);

// Simple inline verification function to avoid ESM/CommonJS compatibility issues
async function verifyWidgetManifest(packagePath: string, packageJson: any): Promise<void> {
    try {
        const packageXmlPath = join(packagePath, "src", "package.xml");
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

export interface ToolDependencies {
    repoRoot: string;
    guardrails: any;
}

export function getBuildTools(deps: ToolDependencies): ToolDefinition[] {
    const { repoRoot, guardrails } = deps;

    return [
        {
            name: "verify_manifest_versions",
            title: "Verify Manifest Versions",
            description:
                "Verify that package.json and package.xml versions are in sync for a widget. Accepts either a full path or widget name (e.g., 'combobox-web' or '@mendix/combobox-web')",
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
        },
        {
            name: "build_widget",
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
            },
            handler: withGuardrails(
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
                            destinationPath === ""
                                ? "default (testProject)"
                                : destinationPath || "default (testProject)",
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
        },
        {
            name: "run_tests",
            title: "Run Tests",
            description: "Run tests for a widget package",
            inputSchema: {
                packagePath: z.string().describe("Path to the widget package directory"),
                kind: z.enum(["unit", "e2e"]).optional().describe("Type of tests to run")
            },
            handler: withGuardrails(async ({ packagePath, kind }) => {
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
        },
        {
            name: "create_translation",
            title: "Create Translation",
            description: "Generate translation files for widgets using turbo",
            inputSchema: {
                packageFilter: z.string().optional().describe("Optional package filter for turbo")
            },
            handler: withGuardrails(async ({ packageFilter }) => {
                let command = "turbo run create-translation";
                if (packageFilter) {
                    command += ` --filter=${packageFilter}`;
                }

                guardrails.validateCommand(command, repoRoot);

                const { stdout, stderr } = await exec(command, {
                    cwd: repoRoot,
                    env: guardrails.createSafeEnv()
                });

                const result: TranslationResult = formatCommandResult(
                    true,
                    command,
                    stdout,
                    stderr
                ) as TranslationResult;

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
