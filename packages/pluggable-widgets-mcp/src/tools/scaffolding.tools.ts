import { mkdir } from "node:fs/promises";
import { z } from "zod";
import { GENERATIONS_DIR } from "@/config";
import type { ToolContext, ToolDefinition, ToolResponse } from "@/tools/types";
import {
    buildWidgetOptions,
    DEFAULT_WIDGET_OPTIONS,
    GENERATOR_PROMPTS,
    runWidgetGenerator,
    SCAFFOLD_PROGRESS
} from "@/tools/utils/generator";
import { ProgressTracker } from "@/tools/utils/progress-tracker";
import { createErrorResponse, createToolResponse } from "@/tools/utils/response";

const createWidgetSchema = z.object({
    name: z
        .string()
        .min(1)
        .max(100)
        .describe("[REQUIRED] The name of the widget in PascalCase (e.g., 'MyAwesomeWidget', 'DataChart')"),
    description: z.string().min(1).max(200).describe("[REQUIRED] A brief description of what the widget does"),
    version: z
        .string()
        .regex(/^\d+\.\d+\.\d+$/, "Version must be in semver format: x.y.z")
        .optional()
        .describe(`[OPTIONAL] Initial version in semver format. Default: "${DEFAULT_WIDGET_OPTIONS.version}"`),
    author: z
        .string()
        .min(1)
        .max(100)
        .optional()
        .describe(`[OPTIONAL] Author name. Default: "${DEFAULT_WIDGET_OPTIONS.author}"`),
    license: z
        .string()
        .min(1)
        .max(50)
        .optional()
        .describe(`[OPTIONAL] License type. Default: "${DEFAULT_WIDGET_OPTIONS.license}"`),
    organization: z
        .string()
        .min(1)
        .max(100)
        .optional()
        .describe(
            `[OPTIONAL] Organization name for the widget namespace. Default: "${DEFAULT_WIDGET_OPTIONS.organization}"`
        ),
    template: z
        .enum(["full", "empty"])
        .optional()
        .describe(
            `[OPTIONAL] Widget template: "full" includes sample code and examples, "empty" is minimal/blank. Default: "${DEFAULT_WIDGET_OPTIONS.template}"`
        ),
    programmingLanguage: z
        .enum(["typescript", "javascript"])
        .optional()
        .describe(
            `[OPTIONAL] Programming language for the widget source code. Default: "${DEFAULT_WIDGET_OPTIONS.programmingLanguage}"`
        ),
    unitTests: z
        .boolean()
        .optional()
        .describe(`[OPTIONAL] Include unit test setup with Jest. Default: ${DEFAULT_WIDGET_OPTIONS.unitTests}`),
    e2eTests: z
        .boolean()
        .optional()
        .describe(
            `[OPTIONAL] Include end-to-end test setup with Playwright. Default: ${DEFAULT_WIDGET_OPTIONS.e2eTests}`
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

Ask the user if they want to customize any options before proceeding.`;

export function getScaffoldingTools(): Array<ToolDefinition<CreateWidgetInput>> {
    return [
        {
            name: "create-widget",
            title: "Create Widget",
            description: CREATE_WIDGET_DESCRIPTION,
            inputSchema: createWidgetSchema,
            handler: handleCreateWidget
        }
    ];
}

async function handleCreateWidget(args: CreateWidgetInput, context: ToolContext): Promise<ToolResponse> {
    const options = buildWidgetOptions(args);
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
            organization: options.organization
        });

        // Ensure generations directory exists
        await mkdir(GENERATIONS_DIR, { recursive: true });

        const widgetFolder = await runWidgetGenerator(options, tracker);
        const widgetPath = `${GENERATIONS_DIR}/${widgetFolder}`;

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
                "Next steps:",
                `1. cd ${widgetPath}`,
                "2. pnpm install",
                "3. pnpm start (to build and watch for changes)",
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
        return createErrorResponse(`Failed to create widget: ${message}`);
    }
}
