import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { copyFile, mkdir } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import { z } from "zod";
import { GENERATIONS_DIR, validateProjectDir } from "@/config";
import { isPathAllowed } from "./utils/sandbox";
import type { ToolResponse } from "@/tools/types";
import { findMpkFile } from "@/tools/utils/mpk";
import { createStructuredError, createStructuredErrorResponse, createToolResponse } from "@/tools/utils/response";
import type { SessionState } from "./session-state";

function formatProjectInfo(validation: Awaited<ReturnType<typeof validateProjectDir>>): string {
    const lines: string[] = [
        `Project Directory: ${validation.projectDir}`,
        ...(validation.projectName ? [`Project Name:      ${validation.projectName}`] : []),
        `Widgets Directory: ${validation.widgetsDir}`
    ];

    if (validation.existingWidgets.length > 0) {
        lines.push(`Existing Widgets (${validation.existingWidgets.length}):`);
        for (const widget of validation.existingWidgets) {
            lines.push(`  - ${widget}`);
        }
    } else {
        lines.push(`Existing Widgets:  (none)`);
    }

    return lines.join("\n");
}

export function registerProjectTools(server: McpServer, state: SessionState): void {
    server.registerTool(
        "get-project-info",
        {
            title: "Get Project Info",
            description:
                "Returns information about the configured Mendix project directory. " +
                "Call this first to discover the project context before creating or deploying widgets. " +
                "Returns the project directory, project name, widgets directory, and existing .mpk files.",
            inputSchema: z.object({})
        },
        async (): Promise<ToolResponse> => {
            if (!state.projectDir) {
                return createStructuredErrorResponse(
                    createStructuredError("ERR_PROJECT_NOT_CONFIGURED", "No Mendix project directory is configured.", {
                        suggestion:
                            "Set the MENDIX_PROJECT_DIR environment variable when starting the server, e.g.:\n" +
                            "  MENDIX_PROJECT_DIR=/Users/you/Mendix/MyProject node dist/index.js http\n" +
                            "Or call set-project-directory to configure it at runtime."
                    })
                );
            }

            const validation = await validateProjectDir(state.projectDir);
            if (!validation.valid) {
                return createStructuredErrorResponse(
                    createStructuredError(
                        "ERR_PROJECT_NOT_CONFIGURED",
                        `Configured project directory is invalid: ${validation.error}`,
                        { suggestion: "Use set-project-directory to set a valid Mendix project directory." }
                    )
                );
            }

            return createToolResponse(`✅ Project configured\n\n${formatProjectInfo(validation)}`);
        }
    );

    server.registerTool(
        "set-project-directory",
        {
            title: "Set Project Directory",
            description:
                "Configures the Mendix project directory for this session. " +
                "The directory must exist and contain a .mpr file. " +
                "Once set, deploy-widget can copy built .mpk files to the project's widgets/ folder.",
            inputSchema: z.object({
                projectDir: z
                    .string()
                    .describe("Absolute path to the Mendix project directory (must contain a .mpr file)")
            })
        },
        async (args: { projectDir: string }): Promise<ToolResponse> => {
            const resolvedDir = resolve(args.projectDir);
            const validation = await validateProjectDir(resolvedDir);
            if (!validation.valid) {
                return createStructuredErrorResponse(
                    createStructuredError(
                        "ERR_PROJECT_NOT_CONFIGURED",
                        `Invalid project directory: ${validation.error}`,
                        {
                            suggestion:
                                "Provide the absolute path to a directory that exists and contains a .mpr file, e.g.:\n" +
                                "  /Users/you/Mendix/MyProject"
                        }
                    )
                );
            }

            state.projectDir = validation.projectDir;
            return createToolResponse(`✅ Project directory configured\n\n${formatProjectInfo(validation)}`);
        }
    );

    server.registerTool(
        "deploy-widget",
        {
            title: "Deploy Widget",
            description:
                "Copies a built widget .mpk file to the configured Mendix project's widgets/ directory. " +
                "Call this after build-widget succeeds. " +
                "Requires a project directory to be configured (via MENDIX_PROJECT_DIR env var or set-project-directory). " +
                "Looks for the .mpk file in the widget's dist/ directory. " +
                "After deploying, synchronize the app directory in Studio Pro to pick up the new widget.",
            inputSchema: z.object({
                widgetPath: z
                    .string()
                    .describe("Absolute path to the widget directory (the one containing package.json and dist/)")
            })
        },
        async (args: { widgetPath: string }): Promise<ToolResponse> => {
            if (!state.projectDir) {
                return createStructuredErrorResponse(
                    createStructuredError("ERR_PROJECT_NOT_CONFIGURED", "No Mendix project directory is configured.", {
                        suggestion:
                            "Call get-project-info to check the current configuration, " +
                            "or set-project-directory to configure a project directory."
                    })
                );
            }

            if (!isPathAllowed(args.widgetPath, state, "MCP_ALLOWED_BUILD_PATHS")) {
                return createStructuredErrorResponse(
                    createStructuredError(
                        "ERR_NOT_FOUND",
                        `Widget path is not within an allowed directory: ${args.widgetPath}`,
                        {
                            suggestion: `Widget must be within ${GENERATIONS_DIR} or an allowed build path.`
                        }
                    )
                );
            }

            const mpkPath = findMpkFile(args.widgetPath);
            if (!mpkPath) {
                return createStructuredErrorResponse(
                    createStructuredError("ERR_MPK_NOT_FOUND", `No .mpk file found in ${args.widgetPath}/dist/`, {
                        suggestion: "Run build-widget first to compile the widget and produce the .mpk file."
                    })
                );
            }

            const widgetsDir = join(state.projectDir, "widgets");
            try {
                await mkdir(widgetsDir, { recursive: true });
                const mpkFileName = basename(mpkPath);
                const destPath = join(widgetsDir, mpkFileName);
                await copyFile(mpkPath, destPath);

                return createToolResponse(
                    [
                        `✅ Widget deployed successfully!`,
                        ``,
                        `Source:      ${mpkPath}`,
                        `Destination: ${destPath}`,
                        ``,
                        `Synchronize the app directory in Studio Pro to pick up the new widget.`
                    ].join("\n")
                );
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                return createStructuredErrorResponse(
                    createStructuredError("ERR_DEPLOY_FAILED", `Failed to deploy widget: ${message}`, {
                        suggestion: "Check write permissions on the widgets directory.",
                        rawOutput: message
                    })
                );
            }
        }
    );
}
