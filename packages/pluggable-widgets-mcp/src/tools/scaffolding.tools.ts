import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { GENERATIONS_DIR } from "@/config";
import { DEFAULT_WIDGET_OPTIONS, type ToolContext, type ToolResponse, widgetOptionsSchema } from "@/tools/types";
import { buildWidgetOptions, runWidgetGenerator, SCAFFOLD_PROGRESS } from "@/tools/utils/generator";
import { ProgressTracker } from "@/tools/utils/progress-tracker";
import {
    createStructuredError,
    createStructuredErrorResponse,
    createToolResponse,
    type ErrorCode
} from "@/tools/utils/response";
import { access, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { z } from "zod";

/**
 * Schema for create-widget tool input.
 * Extends the base widgetOptionsSchema with tool-specific options like outputPath.
 */
const createWidgetSchema = widgetOptionsSchema.extend({
    outputPath: z
        .string()
        .optional()
        .describe(
            "[OPTIONAL] Directory where widget will be created. Defaults to ./generations/ in the current working directory. For desktop clients without a clear working directory, ask the user for their preferred location."
        )
});

type CreateWidgetInput = z.infer<typeof createWidgetSchema>;

const CREATE_WIDGET_DESCRIPTION = `Scaffolds a new Mendix pluggable widget using the official @mendix/generator-widget.

BEFORE RUNNING: Please confirm all options with the user. Show them the full list of configurable parameters:

REQUIRED:
  • name: Widget name in PascalCase (e.g., "MyAwesomeWidget")
  • description: Brief description of what the widget does

OPTIONAL (with defaults):
  • version: Initial version (default: "${DEFAULT_WIDGET_OPTIONS.version}")
  • author: Author name (default: "${DEFAULT_WIDGET_OPTIONS.author}")
  • license: License type (default: "${DEFAULT_WIDGET_OPTIONS.license}")
  • organization: Namespace organization (default: "${DEFAULT_WIDGET_OPTIONS.organization}")
  • template: "full" (with examples) or "empty" (minimal) (default: "${DEFAULT_WIDGET_OPTIONS.template}")
  • programmingLanguage: "typescript" or "javascript" (default: "${DEFAULT_WIDGET_OPTIONS.programmingLanguage}")
  • unitTests: Include Jest test setup (default: ${DEFAULT_WIDGET_OPTIONS.unitTests})
  • e2eTests: Include Playwright E2E tests (default: ${DEFAULT_WIDGET_OPTIONS.e2eTests})
  • outputPath: Directory where widget will be created (default: ./generations/)

Ask the user if they want to customize any options before proceeding.`;

/**
 * Registers scaffolding-related tools for widget creation and management.
 *
 * Currently registers the create-widget tool. This modular pattern allows
 * easy addition of related tools such as:
 * - Widget property editing
 * - XML configuration management
 * - Build and deployment automation
 *
 * @see AGENTS.md Roadmap Context section for planned additions
 */
export function registerScaffoldingTools(server: McpServer): void {
    server.registerTool(
        "create-widget",
        {
            title: "Create Widget",
            description: CREATE_WIDGET_DESCRIPTION,
            inputSchema: createWidgetSchema
        },
        handleCreateWidget
    );
}

async function handleCreateWidget(args: CreateWidgetInput, context: ToolContext): Promise<ToolResponse> {
    const options = buildWidgetOptions(args);
    const outputDir = args.outputPath ?? GENERATIONS_DIR;

    // Validate user-provided outputPath is within allowed directories
    if (args.outputPath) {
        const resolvedOutputPath = resolve(args.outputPath);
        const allowedOutputPaths = [
            resolve(GENERATIONS_DIR),
            ...(process.env.MCP_ALLOWED_OUTPUT_PATHS ?? "")
                .split(":")
                .filter(Boolean)
                .map(p => resolve(p))
        ];
        const isAllowedPath = allowedOutputPaths.some(
            allowed => resolvedOutputPath.startsWith(allowed + "/") || resolvedOutputPath === allowed
        );
        if (!isAllowedPath) {
            return createStructuredErrorResponse(
                createStructuredError(
                    "ERR_OUTPUT_PATH_INVALID",
                    `Output path is not within an allowed directory: ${args.outputPath}`,
                    {
                        suggestion: `Output must be within ${GENERATIONS_DIR} or set MCP_ALLOWED_OUTPUT_PATHS env var (colon-separated paths).`
                    }
                )
            );
        }
    }

    const tracker = new ProgressTracker({
        context,
        logger: "scaffolding",
        totalSteps: 3
    });

    try {
        // Pre-validate ONLY for default path (catches Claude Desktop's non-existent cwd)
        // For user-provided paths, let mkdir try and give a specific error if it fails
        if (!args.outputPath) {
            const parentDir = dirname(outputDir);
            try {
                await access(parentDir);
            } catch {
                return createStructuredErrorResponse(
                    createStructuredError("ERR_OUTPUT_PATH_REQUIRED", "Cannot create widget in default location", {
                        suggestion:
                            "The default output directory is not accessible (common in Claude Desktop). Please provide an explicit 'outputPath' parameter with a valid directory path on your system (e.g., '/Users/yourname/Projects/widgets', '~/widgets', or '/tmp/widgets').",
                        rawOutput: `Default path "${outputDir}" is not accessible. The working directory may not exist in this environment.`
                    })
                );
            }
        }

        console.error(`[create-widget] Starting widget scaffolding for "${options.name}"...`);
        await tracker.progress(SCAFFOLD_PROGRESS.START, `Starting widget scaffolding for "${options.name}"...`);
        await tracker.info(`Starting widget scaffolding for "${options.name}"...`, {
            widgetName: options.name,
            template: options.template,
            organization: options.organization,
            outputDir
        });

        // Ensure output directory exists
        await mkdir(outputDir, { recursive: true });

        // The generator creates the widget folder itself (camelCase: first letter lowered)
        const widgetFolder = options.name.charAt(0).toLowerCase() + options.name.slice(1);
        const widgetPath = `${outputDir}/${widgetFolder}`;

        // Run generator inside outputDir — it creates the widget subfolder
        await runWidgetGenerator(options, tracker, outputDir);

        console.error(`[create-widget] Widget created successfully at ${widgetPath}`);
        await tracker.progress(SCAFFOLD_PROGRESS.COMPLETE, "Widget created successfully!");
        await tracker.info("Widget created successfully!", {
            widgetName: options.name,
            path: widgetPath
        });

        return createToolResponse(
            [
                `Widget "${options.name}" created successfully!`,
                "",
                `Location: ${widgetPath}`,
                "",
                "=== TO IMPLEMENT WIDGET FUNCTIONALITY ===",
                "",
                "1. FETCH GUIDELINES (MCP Resources):",
                "   - mendix://guidelines/property-types (all widget property types with JSON schema)",
                "   - mendix://guidelines/widget-patterns (reusable TSX/SCSS patterns for common widget types)",
                "",
                "2. EXPLORE WIDGET STRUCTURE:",
                `   Use list-widget-files tool with widgetPath: "${widgetPath}"`,
                "",
                "3. READ EXISTING CODE:",
                `   Use read-widget-file tool to inspect:`,
                `   - src/${options.name}.tsx (main component entry point)`,
                `   - src/${options.name}.xml (widget properties definition)`,
                `   - src/components/ (UI components - create if needed)`,
                "",
                "4. IMPLEMENT CHANGES:",
                `   Use write-widget-file tool to create/update files`,
                "",
                "=== KEY FILES ===",
                `- ${widgetPath}/src/${options.name}.tsx - Main widget component`,
                `- ${widgetPath}/src/${options.name}.xml - Properties configuration`,
                `- ${widgetPath}/src/${options.name}.editorPreview.tsx - Studio Pro preview`,
                "",
                "=== BUILD & TEST ===",
                `1. cd ${widgetPath}`,
                "2. npm install",
                "3. npm start (builds and watches for changes)",
                "",
                "The widget will be available in Mendix Studio Pro after syncing the app directory."
            ].join("\n")
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        await tracker.error(`Failed to create widget: ${message}`, {
            widgetName: options.name,
            error: message
        });

        // Categorize the error for structured response
        let code: ErrorCode = "ERR_SCAFFOLD_FAILED";
        let suggestion = "Check the error details and try again. Ensure you have npm/npx available.";

        if (message.includes("timed out")) {
            code = "ERR_SCAFFOLD_TIMEOUT";
            suggestion =
                "The generator took too long. Check your network connection and npm registry access. Try running 'npx @mendix/generator-widget' manually.";
        } else if (message.includes("ENOENT") || message.includes("not found")) {
            code = "ERR_NOT_FOUND";
            // Check if this is a path issue vs a command issue
            if (message.includes("mkdir") || message.includes(outputDir)) {
                suggestion = `Cannot create directory "${outputDir}". Try a different 'outputPath' that you have write access to.`;
            } else {
                suggestion =
                    "The generator-widget binary was not found. Run: cd /path/to/widgets-tools/packages/generator-widget && npm link. Then ensure the MCP server runs under the same Node.js version.";
            }
        }

        return createStructuredErrorResponse(
            createStructuredError(code, `Failed to create widget "${options.name}"`, {
                suggestion,
                rawOutput: message
            })
        );
    }
}
