/**
 * Build tools for Mendix pluggable widgets.
 * Wraps pluggable-widget-tools for building and validating widgets.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join, normalize, sep } from "node:path";
import { z } from "zod";
import { GENERATIONS_DIR } from "@/config";
import type { ToolContext, ToolResponse } from "./types";
import { ProgressTracker } from "./utils/progress-tracker";
import { createStructuredError, createStructuredErrorResponse, createToolResponse } from "./utils/response";
import { findMpkFile } from "./utils/mpk";
import { isPathAllowed } from "./utils/sandbox";
import type { SessionState } from "./session-state";

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
export interface ParsedError {
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
 * Rollup TS error pattern from pluggable-widgets-tools build:
 * (plugin typescript) RollupError: @rollup/plugin-typescript TS6133: 'executeAction' is declared but its value is never read.
 */
const ROLLUP_TS_ERROR_PATTERN = /RollupError:.*?(TS\d+):\s*(.+)/;

/**
 * File location pattern that follows Rollup errors on the next line:
 * src/CounterTwo.tsx (2:1)
 */
const ROLLUP_FILE_LOCATION_PATTERN = /^(.+?\.\w+)\s+\((\d+):(\d+)\)$/;

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

    // Try Rollup TS error pattern
    const rollupMatch = line.match(ROLLUP_TS_ERROR_PATTERN);
    if (rollupMatch) {
        return {
            tsCode: rollupMatch[1],
            message: rollupMatch[2],
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
        // Matches standard TS errors, simple TS errors, and Rollup TS errors
        if (trimmed.includes("error TS") || trimmed.match(/:\s*error\s+TS/) || trimmed.includes("RollupError:")) {
            const parsed = parseTypeScriptError(trimmed);
            if (parsed) {
                errors.push(parsed);
                continue;
            }
        }

        // Check for Rollup file location pattern on a line following a Rollup error
        // Format: "src/Widget.tsx (2:1)"
        const fileLocMatch = trimmed.match(ROLLUP_FILE_LOCATION_PATTERN);
        if (fileLocMatch && errors.length > 0) {
            const lastError = errors[errors.length - 1];
            if (!lastError.file) {
                lastError.file = fileLocMatch[1];
                lastError.line = parseInt(fileLocMatch[2], 10);
                lastError.column = parseInt(fileLocMatch[3], 10);
            }
            continue;
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
 * Formats a build failure response for Maia, including:
 * - All errors with file/line/column/code
 * - Content of every source file that appears in the error list
 *
 * Embedding file content lets Maia fix errors without an extra read-widget-file
 * round-trip. Output format is designed to be read by an AI agent.
 */
export async function formatBuildFailureResponse(errors: ParsedError[], widgetPath: string): Promise<string> {
    // Format error list — each error gets code, location (file line N col N), and message
    const errorLines = errors.map(e => {
        const loc = e.file
            ? `${e.file}${e.line != null ? ` line ${e.line}` : ""}${e.column != null ? ` col ${e.column}` : ""}`
            : null;
        const code = e.tsCode ? `[${e.tsCode}]` : `[${e.category}]`;
        const locStr = loc ? ` ${loc} —` : "";
        return `  ${code}${locStr} ${e.message}`;
    });

    // Collect unique source files that appear in errors
    const uniqueFiles = [...new Set(errors.map(e => e.file).filter((f): f is string => !!f))];

    // Read each failing file (skip if not found — don't throw)
    const fileSections: string[] = [];
    for (const relPath of uniqueFiles) {
        // Block path traversal: only allow files under widgetPath
        const normalizedBase = normalize(widgetPath);
        const fullPath = normalize(join(widgetPath, relPath));
        if (!fullPath.startsWith(normalizedBase + sep) && fullPath !== normalizedBase) continue;
        if (!existsSync(fullPath)) continue;

        try {
            const content = await readFile(fullPath, "utf-8");
            fileSections.push(`--- ${relPath} ---\n${content}`);
        } catch {
            // Skip unreadable files silently
        }
    }

    const lines = [
        `❌ Build failed — ${errors.length} error(s). Fix the errors below, write with write-widget-file, then retry build-widget (max 3 attempts total).`,
        "",
        "Errors:",
        ...errorLines
    ];

    if (fileSections.length > 0) {
        lines.push("", "Failing file contents:", "");
        lines.push(...fileSections);
    }

    return lines.join("\n");
}

/**
 * Formats a successful build response, including MPK path, warnings, and a
 * chaining instruction to call deploy-widget next.
 */
export function formatBuildSuccessResponse(
    mpkPath: string | undefined,
    widgetPath: string,
    warnings: string[]
): string {
    let message = "✅ Build successful!";
    if (mpkPath) {
        message += `\n\n📦 MPK output: ${mpkPath}`;
    }
    if (warnings.length > 0) {
        message += `\n\n⚠️ Warnings:\n${warnings.map(w => `  - ${w}`).join("\n")}`;
    }
    message += `\n\n🚀 Next step: Call deploy-widget with widgetPath: "${widgetPath}" to copy the .mpk to your Mendix project's widgets/ directory.`;
    return message;
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
 * Handler for the build-widget tool.
 */
async function handleBuildWidget(
    args: BuildWidgetInput,
    context: ToolContext,
    state: SessionState
): Promise<ToolResponse> {
    const { widgetPath } = args;

    // Validate path exists
    if (!existsSync(widgetPath)) {
        return createStructuredErrorResponse(
            createStructuredError("ERR_NOT_FOUND", `Widget directory not found: ${widgetPath}`, {
                suggestion: "Verify the widget path is correct and the directory exists."
            })
        );
    }

    // Validate path is within allowed directories
    if (!isPathAllowed(widgetPath, state, "MCP_ALLOWED_BUILD_PATHS")) {
        return createStructuredErrorResponse(
            createStructuredError("ERR_NOT_FOUND", `Widget path is not within an allowed directory: ${widgetPath}`, {
                suggestion: `Widget must be within ${GENERATIONS_DIR} or set MCP_ALLOWED_BUILD_PATHS env var (colon-separated paths).`
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
            return createToolResponse(formatBuildSuccessResponse(mpkPath, widgetPath, result.warnings));
        } else {
            if (result.errors.length > 0) {
                const message = await formatBuildFailureResponse(result.errors, widgetPath);
                return { content: [{ type: "text", text: message }], isError: true };
            }

            // Fallback for unknown failures (no structured errors detected)
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
export function registerBuildTools(server: McpServer, state: SessionState): void {
    server.registerTool(
        "build-widget",
        {
            title: "Build Widget",
            description:
                "Builds a Mendix pluggable widget using pluggable-widget-tools. " +
                "Validates XML, compiles TypeScript, generates types, and produces an .mpk file. " +
                "If the build fails with TypeScript errors, the response includes ALL errors with " +
                "file locations AND the content of every failing source file. " +
                "RETRY LOOP: On failure, (1) read the errors and embedded file content, " +
                "(2) fix the TypeScript errors, (3) write the fixed files using write-widget-file, " +
                "(4) call build-widget again. Repeat until the build passes. " +
                "Maximum 3 total attempts — if still failing after 3 attempts, " +
                "report the errors and file contents to the user. " +
                "SUCCESS: When the build succeeds, you MUST call deploy-widget next with the same widgetPath " +
                "to copy the .mpk to the Mendix project. Do not stop after a successful build.",
            inputSchema: buildWidgetSchema
        },
        (args, context) => handleBuildWidget(args, context, state)
    );
}
