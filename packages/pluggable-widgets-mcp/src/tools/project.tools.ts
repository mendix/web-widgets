import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { existsSync } from "node:fs";
import { copyFile, mkdir } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import { z } from "zod";
import { type ProjectValidation, validateProjectDir } from "@/config";
import type { ToolResponse } from "@/tools/types";
import { findMpkFile } from "@/tools/utils/mpk";
import { fail, ok } from "@/tools/utils/response";
import { describeAllowedRoots, isPathAllowed } from "./utils/sandbox";
import type { SessionState } from "./session-state";

function formatProjectInfo(validation: ProjectValidation): string {
    const lines = [
        `Project directory: ${validation.projectDir}`,
        ...(validation.projectName ? [`Project name:      ${validation.projectName}`] : []),
        `Widgets directory: ${validation.widgetsDir}`
    ];

    if (validation.existingWidgets.length > 0) {
        lines.push(`Existing widgets (${validation.existingWidgets.length}):`);
        lines.push(...validation.existingWidgets.map(widget => `  - ${widget}`));
    } else {
        lines.push("Existing widgets:  (none)");
    }

    return lines.join("\n");
}

export function registerProjectTools(server: McpServer, state: SessionState): void {
    server.registerTool(
        "get-project-info",
        {
            title: "Get Project Info",
            description:
                "Returns the configured Mendix project directory, its name, and the .mpk widgets " +
                "already deployed to it. Call this first to discover the project context.",
            inputSchema: z.object({})
        },
        async (): Promise<ToolResponse> => {
            if (!state.projectDir) {
                return fail("ERR_PROJECT_NOT_CONFIGURED", "No Mendix project directory is configured.", {
                    suggestion:
                        "Start the server with MENDIX_PROJECT_DIR set, or call set-project-directory to configure one at runtime."
                });
            }

            const validation = await validateProjectDir(state.projectDir);
            if (!validation.valid) {
                return fail(
                    "ERR_PROJECT_NOT_CONFIGURED",
                    `Configured project directory is invalid: ${validation.error}`,
                    { suggestion: "Use set-project-directory to point at a valid Mendix project." }
                );
            }

            return ok(formatProjectInfo(validation));
        }
    );

    server.registerTool(
        "set-project-directory",
        {
            title: "Set Project Directory",
            description:
                "Points this session at a Mendix project. The directory must exist and contain " +
                "exactly one .mpr file. It also becomes the sandbox root: every path the server " +
                "touches must resolve inside it.",
            inputSchema: z.object({
                projectDir: z
                    .string()
                    .describe("Absolute path to the Mendix project directory (must contain a .mpr file)")
            })
        },
        async (args: { projectDir: string }): Promise<ToolResponse> => {
            const validation = await validateProjectDir(resolve(args.projectDir));
            if (!validation.valid) {
                return fail("ERR_PROJECT_NOT_CONFIGURED", `Invalid project directory: ${validation.error}`, {
                    suggestion: "Provide the absolute path to a directory containing a .mpr file."
                });
            }

            state.projectDir = validation.projectDir;
            return ok(formatProjectInfo(validation));
        }
    );

    server.registerTool(
        "deploy-widget",
        {
            title: "Deploy Widget",
            description:
                "Copies a widget's built .mpk into the Mendix project's widgets/ directory. " +
                "Reports whether an existing .mpk of the same name was replaced. Synchronize the " +
                "app directory in Studio Pro afterwards to pick the widget up.",
            inputSchema: z.object({
                widgetPath: z
                    .string()
                    .describe("Absolute path to the widget directory (the one containing package.json and dist/)")
            })
        },
        async (args: { widgetPath: string }): Promise<ToolResponse> => {
            if (!state.projectDir) {
                return fail("ERR_PROJECT_NOT_CONFIGURED", "No Mendix project directory is configured.", {
                    suggestion: "Call set-project-directory to configure one."
                });
            }

            if (!isPathAllowed(args.widgetPath, state)) {
                return fail("ERR_OUTPUT_PATH_INVALID", `Widget path is outside the project: ${args.widgetPath}`, {
                    suggestion: `Allowed roots: ${describeAllowedRoots(state)}.`
                });
            }

            const mpkPath = findMpkFile(args.widgetPath);
            if (!mpkPath) {
                return fail("ERR_MPK_NOT_FOUND", `No .mpk found under ${args.widgetPath}/dist/`, {
                    suggestion: "Run build-widget first."
                });
            }

            const widgetsDir = join(state.projectDir, "widgets");
            try {
                await mkdir(widgetsDir, { recursive: true });
                const mpkFileName = basename(mpkPath);
                const destPath = join(widgetsDir, mpkFileName);

                // Redeploy is the expected workflow (build → deploy → fix → build → deploy), so the
                // overwrite stays. The fix for "silent" is saying so, not blocking it.
                const replaced = existsSync(destPath);
                await copyFile(mpkPath, destPath);

                return ok(
                    [
                        replaced ? `Replaced ${mpkFileName} in the project.` : `Deployed ${mpkFileName}.`,
                        "",
                        `Source:      ${mpkPath}`,
                        `Destination: ${destPath}`,
                        "",
                        "Synchronize the app directory in Studio Pro to pick up the widget."
                    ].join("\n")
                );
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                return fail("ERR_DEPLOY_FAILED", `Failed to deploy widget: ${message}`, {
                    suggestion: "Check write permissions on the widgets directory.",
                    details: message
                });
            }
        }
    );
}
