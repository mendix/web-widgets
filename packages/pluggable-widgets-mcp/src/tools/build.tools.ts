/**
 * Build tools for Mendix pluggable widgets.
 * Wraps pluggable-widget-tools for building and validating widgets.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { spawn } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import type { ToolContext, ToolResponse } from "./types";
import { ProgressTracker } from "./utils/progress-tracker";
import {
    createStructuredError,
    createStructuredErrorResponse,
    createToolResponse,
    type StructuredError
} from "./utils/response";

/**
 * Input schema for build-widget tool.
 */
const buildWidgetSchema = z.object({
    widgetPath: z.string().describe("Absolute path to the widget directory (containing package.json)")
});

type BuildWidgetInput = z.infer<typeof buildWidgetSchema>;

/**
 * Parsed error with location information.
 */
interface ParsedError {
    message: string;
    file?: string;
    line?: number;
    column?: number;
    tsCode?: string; // e.g., "TS2339"
    category: "typescript" | "xml" | "dependency" | "unknown";
}

/**
 * Result of parsing build output.
 */
interface BuildResult {
    success: boolean;
    mpkPath?: string;
    errors: ParsedError[];
    warnings: string[];
    output: string;
}

/**
 * TypeScript error pattern: src/Component.tsx(42,5): error TS2339: Property 'x' does not exist
 * Also matches: src/Component.tsx:42:5 - error TS2339: Property 'x' does not exist
 */
const TS_ERROR_PATTERN = /^(.+?)[:(](\d+)[,:](\d+)[):]?\s*[-:]?\s*error\s+(TS\d+):\s*(.+)$/;

/**
 * Simple TS error pattern: error TS2339: Property 'x' does not exist
 */
const TS_ERROR_SIMPLE_PATTERN = /^error\s+(TS\d+):\s*(.+)$/;

/**
 * XML error patterns
 */
const XML_ERROR_PATTERNS = [/XML.*error/i, /invalid.*xml/i, /schema.*validation.*failed/i, /widget\.xml.*error/i];

/**
 * Dependency error patterns
 */
const DEP_ERROR_PATTERNS = [/cannot find module/i, /module not found/i, /npm ERR!/i, /ENOENT.*node_modules/i];

/**
 * Parses a TypeScript error line to extract file, line, column, code, and message.
 */
function parseTypeScriptError(line: string): ParsedError | null {
    // Try full pattern with file location
    const fullMatch = line.match(TS_ERROR_PATTERN);
    if (fullMatch) {
        return {
            file: fullMatch[1],
            line: parseInt(fullMatch[2], 10),
            column: parseInt(fullMatch[3], 10),
            tsCode: fullMatch[4],
            message: fullMatch[5],
            category: "typescript"
        };
    }

    // Try simple pattern without file location
    const simpleMatch = line.match(TS_ERROR_SIMPLE_PATTERN);
    if (simpleMatch) {
        return {
            tsCode: simpleMatch[1],
            message: simpleMatch[2],
            category: "typescript"
        };
    }

    return null;
}

/**
 * Parses the build output to extract meaningful errors and warnings.
 */
function parseBuildOutput(stdout: string, stderr: string): BuildResult {
    const output = stdout + "\n" + stderr;
    const errors: ParsedError[] = [];
    const warnings: string[] = [];
    let mpkPath: string | undefined;

    const lines = output.split("\n");

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // TypeScript errors (try to parse with location)
        if (trimmed.includes("error TS") || trimmed.match(/:\s*error\s+TS/)) {
            const parsed = parseTypeScriptError(trimmed);
            if (parsed) {
                errors.push(parsed);
                continue;
            }
        }

        // XML validation errors
        if (XML_ERROR_PATTERNS.some(pattern => pattern.test(trimmed))) {
            errors.push({
                message: trimmed,
                category: "xml"
            });
            continue;
        }

        // Dependency errors
        if (DEP_ERROR_PATTERNS.some(pattern => pattern.test(trimmed))) {
            errors.push({
                message: trimmed,
                category: "dependency"
            });
            continue;
        }

        // General errors (fallback)
        if (trimmed.startsWith("error:") || trimmed.startsWith("Error:")) {
            errors.push({
                message: trimmed.replace(/^[Ee]rror:\s*/, ""),
                category: "unknown"
            });
            continue;
        }

        // Warnings
        if (trimmed.startsWith("warning:") || trimmed.startsWith("Warning:")) {
            warnings.push(trimmed);
        }

        // MPK output path
        if (trimmed.includes(".mpk")) {
            const mpkMatch = trimmed.match(/([^\s]+\.mpk)/);
            if (mpkMatch) {
                mpkPath = mpkMatch[1];
            }
        }
    }

    // Check for success indicators
    // pluggable-widgets-tools outputs "created dist/..." when successful
    const hasCreatedOutput = output.includes("created dist/") || output.includes("created dist\\");
    const success =
        errors.length === 0 &&
        (output.includes("Build completed") || output.includes("successfully") || hasCreatedOutput || mpkPath);

    return {
        success: !!success,
        mpkPath,
        errors,
        warnings,
        output
    };
}

/**
 * Build progress phases for user-friendly messages.
 */
const BUILD_PHASES = {
    START: { progress: 0, message: "Starting build process..." },
    VALIDATING: { progress: 20, message: "Validating widget XML schema..." },
    GENERATING_TYPES: { progress: 40, message: "Generating TypeScript types from XML..." },
    COMPILING: { progress: 60, message: "Compiling TypeScript..." },
    BUNDLING: { progress: 80, message: "Bundling widget..." },
    COMPLETE: { progress: 100, message: "Build complete!" }
} as const;

/**
 * Runs the build command and returns the result.
 */
async function runBuild(widgetPath: string, tracker?: ProgressTracker): Promise<BuildResult> {
    return new Promise(resolve => {
        // Report start
        tracker?.progress(BUILD_PHASES.START.progress, BUILD_PHASES.START.message);

        // Use npm run build to run pluggable-widgets-tools (correct package name)
        const buildProcess = spawn("npm", ["run", "build"], {
            cwd: widgetPath,
            shell: true,
            env: {
                ...globalThis.process.env,
                FORCE_COLOR: "0" // Disable colors for easier parsing
            }
        });

        let stdout = "";
        let stderr = "";

        buildProcess.stdout?.on("data", (data: Buffer) => {
            const chunk = data.toString();
            stdout += chunk;

            // Update progress based on build output
            if (tracker) {
                if (chunk.includes("Validating") || chunk.includes("XML")) {
                    tracker.progress(BUILD_PHASES.VALIDATING.progress, BUILD_PHASES.VALIDATING.message);
                    tracker.updateStep("validating");
                } else if (chunk.includes("Generating") || chunk.includes("types")) {
                    tracker.progress(BUILD_PHASES.GENERATING_TYPES.progress, BUILD_PHASES.GENERATING_TYPES.message);
                    tracker.updateStep("generating-types");
                } else if (chunk.includes("Compiling") || chunk.includes("tsc")) {
                    tracker.progress(BUILD_PHASES.COMPILING.progress, BUILD_PHASES.COMPILING.message);
                    tracker.updateStep("compiling");
                } else if (chunk.includes("Bundling") || chunk.includes("rollup") || chunk.includes("webpack")) {
                    tracker.progress(BUILD_PHASES.BUNDLING.progress, BUILD_PHASES.BUNDLING.message);
                    tracker.updateStep("bundling");
                }
            }
        });

        buildProcess.stderr?.on("data", (data: Buffer) => {
            stderr += data.toString();
        });

        buildProcess.on("close", code => {
            const result = parseBuildOutput(stdout, stderr);

            // If exit code is non-zero and we didn't detect errors, add generic error
            if (code !== 0 && result.errors.length === 0) {
                result.errors.push({
                    message: `Build failed with exit code ${code}`,
                    category: "unknown"
                });
                result.success = false;
            }

            // Report completion
            if (tracker) {
                if (result.success) {
                    tracker.progress(BUILD_PHASES.COMPLETE.progress, BUILD_PHASES.COMPLETE.message);
                    tracker.markComplete();
                } else {
                    tracker.error(`Build failed with ${result.errors.length} error(s)`);
                }
            }

            resolve(result);
        });

        buildProcess.on("error", err => {
            tracker?.error(`Failed to start build: ${err.message}`);
            resolve({
                success: false,
                errors: [{ message: `Failed to start build process: ${err.message}`, category: "unknown" }],
                warnings: [],
                output: ""
            });
        });
    });
}

/**
 * Converts a parsed error to a structured error with suggestions.
 */
function toStructuredError(error: ParsedError): StructuredError {
    const suggestions: Record<ParsedError["category"], string> = {
        typescript:
            "Check the TypeScript code at the specified location. Ensure props match the generated types from widget XML.",
        xml: "Verify your widget.xml follows the Mendix schema. Check property types and required attributes.",
        dependency:
            "Run 'npm install' in the widget directory. If the issue persists, check that all dependencies are listed in package.json.",
        unknown: "Review the build output for more details. Try running 'npx pluggable-widget-tools build' manually."
    };

    const codeMap: Record<ParsedError["category"], StructuredError["code"]> = {
        typescript: "ERR_BUILD_TS",
        xml: "ERR_BUILD_XML",
        dependency: "ERR_BUILD_MISSING_DEP",
        unknown: "ERR_BUILD_UNKNOWN"
    };

    return createStructuredError(codeMap[error.category], error.message, {
        suggestion: suggestions[error.category],
        file: error.file,
        line: error.line,
        column: error.column
    });
}

/**
 * Finds the most recently created MPK file in the widget's dist directory.
 */
function findMpkFile(widgetPath: string): string | undefined {
    const distPath = join(widgetPath, "dist");
    if (!existsSync(distPath)) return undefined;

    try {
        // Search for .mpk files recursively (usually in dist/x.x.x/)
        const searchDir = (dir: string): string | undefined => {
            const entries = readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = join(dir, entry.name);
                if (entry.isDirectory()) {
                    const found = searchDir(fullPath);
                    if (found) return found;
                } else if (entry.name.endsWith(".mpk")) {
                    return fullPath;
                }
            }
            return undefined;
        };
        return searchDir(distPath);
    } catch {
        return undefined;
    }
}

/**
 * Handler for the build-widget tool.
 */
async function handleBuildWidget(args: BuildWidgetInput, context: ToolContext): Promise<ToolResponse> {
    const { widgetPath } = args;

    // Validate path exists
    if (!existsSync(widgetPath)) {
        return createStructuredErrorResponse(
            createStructuredError("ERR_NOT_FOUND", `Widget directory not found: ${widgetPath}`, {
                suggestion: "Verify the widget path is correct and the directory exists."
            })
        );
    }

    // Check for package.json
    const packageJsonPath = join(widgetPath, "package.json");
    if (!existsSync(packageJsonPath)) {
        return createStructuredErrorResponse(
            createStructuredError("ERR_NOT_FOUND", `No package.json found in ${widgetPath}`, {
                suggestion: "Ensure this is a valid widget directory created with create-widget tool."
            })
        );
    }

    // Create progress tracker
    const tracker = new ProgressTracker({
        context,
        logger: "build",
        totalSteps: 5 // 5 phases: start, validate, generate, compile, bundle
    });

    tracker.start("initializing");

    try {
        // Run build with progress tracking
        const result = await runBuild(widgetPath, tracker);

        // Try to find MPK file if not already detected
        const mpkPath = result.mpkPath || findMpkFile(widgetPath);

        if (result.success) {
            let message = `✅ Build successful!`;

            if (mpkPath) {
                message += `\n\n📦 MPK output: ${mpkPath}`;
            }

            if (result.warnings.length > 0) {
                message += `\n\n⚠️ Warnings:\n${result.warnings.map(w => `  - ${w}`).join("\n")}`;
            }

            return createToolResponse(message);
        } else {
            // Return first error as structured error (most relevant)
            if (result.errors.length > 0) {
                const primaryError = toStructuredError(result.errors[0]);

                // Add additional errors to raw output if multiple
                if (result.errors.length > 1) {
                    const additionalErrors = result.errors
                        .slice(1)
                        .map(e => {
                            const loc = e.file ? `${e.file}${e.line ? `:${e.line}` : ""}` : "";
                            return loc ? `[${loc}] ${e.message}` : e.message;
                        })
                        .join("\n");

                    primaryError.details = {
                        ...primaryError.details,
                        rawOutput: `Additional errors (${result.errors.length - 1}):\n${additionalErrors}`
                    };
                }

                return createStructuredErrorResponse(primaryError);
            }

            // Fallback for unknown failures
            return createStructuredErrorResponse(
                createStructuredError("ERR_BUILD_UNKNOWN", "Build failed with unknown error", {
                    suggestion: "Check the raw build output for details.",
                    rawOutput: result.output.slice(0, 1000)
                })
            );
        }
    } finally {
        tracker.stop();
    }
}

/**
 * Registers the build tools with the MCP server.
 */
export function registerBuildTools(server: McpServer): void {
    server.registerTool(
        "build-widget",
        {
            title: "Build Widget",
            description:
                "Builds a Mendix pluggable widget using pluggable-widget-tools. " +
                "Validates XML, compiles TypeScript, generates types, and produces an .mpk file. " +
                "Returns build errors if any, which can be used to fix issues.",
            inputSchema: buildWidgetSchema
        },
        handleBuildWidget
    );
}
