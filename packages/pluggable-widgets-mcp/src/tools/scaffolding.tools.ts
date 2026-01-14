import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { GENERATIONS_DIR } from "@/config";
import { DEFAULT_WIDGET_OPTIONS, type ToolContext, type ToolResponse, widgetOptionsSchema } from "@/tools/types";
import { buildWidgetOptions, GENERATOR_PROMPTS, runWidgetGenerator, SCAFFOLD_PROGRESS } from "@/tools/utils/generator";
import { ProgressTracker } from "@/tools/utils/progress-tracker";
import {
    createStructuredError,
    createStructuredErrorResponse,
    createToolResponse,
    type ErrorCode
} from "@/tools/utils/response";
import { mkdir } from "node:fs/promises";
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
    const tracker = new ProgressTracker({
        context,
        logger: "scaffolding",
        totalSteps: GENERATOR_PROMPTS.length
    });

    try {
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

        const widgetFolder = await runWidgetGenerator(options, tracker, outputDir);
        const widgetPath = `${outputDir}/${widgetFolder}`;

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
                "   - mendix://guidelines/frontend (CSS/SCSS, Atlas UI, naming conventions)",
                "   - mendix://guidelines/implementation (step-by-step widget development)",
                "   - mendix://guidelines/backend-structure (Mendix data API: EditableValue, ActionValue)",
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
                "2. pnpm install",
                "3. pnpm start (builds and watches for changes)",
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
        } else if (message.includes("prompt") || message.includes("expected")) {
            code = "ERR_SCAFFOLD_PROMPT";
            suggestion =
                "The generator prompts may have changed. This could be a version mismatch. Please report this issue.";
        } else if (message.includes("ENOENT") || message.includes("not found")) {
            code = "ERR_NOT_FOUND";
            suggestion =
                "A required file or command was not found. Ensure node, npm, and npx are installed and in PATH.";
        }

        return createStructuredErrorResponse(
            createStructuredError(code, `Failed to create widget "${options.name}"`, {
                suggestion,
                rawOutput: message
            })
        );
    }
}
