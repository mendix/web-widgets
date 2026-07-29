import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { widgetSourcesDir } from "@/config";
import { type ToolContext, type ToolResponse, widgetOptionsSchema } from "@/tools/types";
import { InvalidAnswerError, MissingAnswerError } from "@/tools/utils/answer-adapter";
import {
    buildWidgetOptions,
    type InstallResult,
    runNpmInstall,
    runWidgetGenerator,
    SCAFFOLD_PROGRESS,
    ScaffoldTimeoutError
} from "@/tools/utils/generator";
import { ProgressTracker } from "@/tools/utils/progress-tracker";
import { type ErrorCode, fail, ok } from "@/tools/utils/response";
import { mkdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
import { describeAllowedRoots, isPathAllowed } from "./utils/sandbox";
import type { SessionState } from "./session-state";
import { createLogger } from "@/tools/utils/logger";

const log = createLogger("create-widget");

/**
 * Schema for create-widget tool input.
 * Extends the base widgetOptionsSchema with tool-specific options like outputPath.
 */
const createWidgetSchema = widgetOptionsSchema.extend({
    outputPath: z
        .string()
        .optional()
        .describe(
            "[OPTIONAL] Directory where the widget will be created. Defaults to widget-sources/ inside the configured Mendix project. Leave unset in most cases — the server manages the output location."
        )
});

type CreateWidgetInput = z.infer<typeof createWidgetSchema>;

/** Reads the widgetName a scaffolded directory declares, if it is one. */
async function readWidgetName(widgetPath: string): Promise<string | undefined> {
    try {
        const pkg = JSON.parse(await readFile(join(widgetPath, "package.json"), "utf-8")) as { widgetName?: string };
        return pkg.widgetName;
    } catch {
        return undefined;
    }
}

/** Node filesystem errors carry a `code`; check that rather than matching the message text. */
function isNodeErrorWithCode(error: unknown, code: string): boolean {
    return error instanceof Error && (error as NodeJS.ErrnoException).code === code;
}

// Every option and its default is already described on the schema fields, which the client receives
// as JSON Schema — restating them here served them to the model twice. The instruction to interview
// the user about paths also contradicted SERVER_INSTRUCTIONS.
const CREATE_WIDGET_DESCRIPTION =
    "Scaffolds a new Mendix pluggable widget with @mendix/generator-widget and installs its " +
    "dependencies. Returns the widget directory, and reports scaffolding and dependency " +
    "installation separately — a failed install still leaves a usable scaffold.";

/**
 * Registers the widget scaffolding tool.
 */
export function registerScaffoldingTools(server: McpServer, state: SessionState): void {
    server.registerTool(
        "create-widget",
        {
            title: "Create Widget",
            description: CREATE_WIDGET_DESCRIPTION,
            inputSchema: createWidgetSchema
        },
        (args, context) => handleCreateWidget(args, context, state)
    );
}

async function handleCreateWidget(
    args: CreateWidgetInput,
    context: ToolContext,
    state: SessionState
): Promise<ToolResponse> {
    const options = buildWidgetOptions(args);

    if (!state.projectDir) {
        return fail("ERR_PROJECT_NOT_CONFIGURED", "No Mendix project is configured", {
            suggestion:
                "Call set-project-directory with the path to the open Mendix project, or start the server with MENDIX_PROJECT_DIR set."
        });
    }

    // Widgets are scaffolded inside the project by default, next to the widgets/ folder builds
    // deploy into, so sources travel with the project in version control.
    const outputDir = args.outputPath ?? widgetSourcesDir(state.projectDir);

    if (!isPathAllowed(outputDir, state)) {
        return fail("ERR_OUTPUT_PATH_INVALID", `Output path is outside the project: ${outputDir}`, {
            suggestion: `Allowed roots: ${describeAllowedRoots(state)}.`
        });
    }

    const tracker = new ProgressTracker({
        context,
        logger: "scaffolding",
        totalSteps: 3
    });

    // Scaffolding and dependency installation fail for different reasons and are reported
    // separately: a failed install still leaves a usable scaffold.
    let installResult: InstallResult = { ok: true };

    try {
        log.info(`Starting widget scaffolding for "${options.name}"...`);
        await tracker.progress(SCAFFOLD_PROGRESS.START, `Starting widget scaffolding for "${options.name}"...`);
        await tracker.info(`Starting widget scaffolding for "${options.name}"...`, {
            widgetName: options.name,
            template: options.template,
            organization: options.organization,
            outputDir
        });

        // The widget folder is ours to create, not the generator's to infer: we point the Yeoman
        // environment's cwd at it directly. It must be fresh and empty — see runWidgetGenerator.
        const widgetFolder = options.name.charAt(0).toLowerCase() + options.name.slice(1);
        const widgetPath = join(outputDir, widgetFolder);

        let alreadyExists = false;
        try {
            await stat(widgetPath);
            alreadyExists = true;
        } catch {
            /* directory doesn't exist yet — proceed with scaffold */
        }

        if (alreadyExists) {
            // Skipping only makes sense if what is there really is this widget. Previously any
            // directory with the right name was reported as a successful scaffold, unverified.
            const existing = await readWidgetName(widgetPath);
            if (existing !== options.name) {
                return fail(
                    "ERR_OUTPUT_PATH_INVALID",
                    `${widgetPath} already exists and is not the "${options.name}" widget` +
                        (existing ? ` (found "${existing}")` : " (no package.json with a widgetName)"),
                    { suggestion: "Choose a different widget name, or remove the directory and try again." }
                );
            }
            log.info(`Widget already scaffolded at ${widgetPath} — skipping`);
            await tracker.progress(SCAFFOLD_PROGRESS.COMPLETE, "Widget already scaffolded — skipping.");
        } else {
            await mkdir(widgetPath, { recursive: true });
            const { askedFor } = await runWidgetGenerator(options, tracker, widgetPath);
            log.info(`Generator prompts answered: ${askedFor.join(", ")}`);

            installResult = await runNpmInstall(widgetPath, tracker);
        }

        log.info(`Widget created successfully at ${widgetPath}`);
        await tracker.progress(SCAFFOLD_PROGRESS.COMPLETE, "Widget created successfully!");
        await tracker.info("Widget created successfully!", {
            widgetName: options.name,
            path: widgetPath
        });

        // Facts, not a tutorial. The workflow is in SERVER_INSTRUCTIONS, sent once at initialize;
        // repeating it on every scaffold spent tokens restating what the model already has.
        return ok(
            [
                `Created widget "${options.name}" at ${widgetPath}.`,
                installResult.ok
                    ? "Dependencies installed."
                    : `Dependencies were NOT installed: ${installResult.error}\nRun "npm install" in the widget directory before building.`,
                "",
                "Next: set-widget-properties to define the widget's properties."
            ].join("\n")
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        await tracker.error(`Failed to create widget: ${message}`, {
            widgetName: options.name,
            error: message
        });

        // Categorize by error type, not by substring-matching the message. The generator runs
        // in-process, so failures arrive as real typed errors instead of an exit code plus text.
        let code: ErrorCode = "ERR_SCAFFOLD_FAILED";
        let suggestion = "Check the error details and try again.";

        if (error instanceof ScaffoldTimeoutError) {
            code = "ERR_SCAFFOLD_TIMEOUT";
            suggestion = "The generator did not finish in time. Retry, and check filesystem responsiveness.";
        } else if (error instanceof MissingAnswerError) {
            suggestion = `The installed @mendix/generator-widget asks for a "${error.promptName}" option this server does not supply — the generator's prompts have changed. Upgrade the server or pin an earlier generator version.`;
        } else if (error instanceof InvalidAnswerError) {
            suggestion = `The generator rejected the "${error.promptName}" value: ${error.reason}. Adjust that argument and retry.`;
        } else if (isNodeErrorWithCode(error, "EACCES") || isNodeErrorWithCode(error, "EPERM")) {
            code = "ERR_NOT_FOUND";
            suggestion = `No permission to write to "${outputDir}". Choose an 'outputPath' you can write to.`;
        } else if (isNodeErrorWithCode(error, "ENOENT")) {
            code = "ERR_NOT_FOUND";
            suggestion = `Cannot create directory "${outputDir}". Check that its parent exists and is writable.`;
        }

        return fail(code, `Failed to create widget "${options.name}"`, {
            suggestion,
            details: message
        });
    }
}
