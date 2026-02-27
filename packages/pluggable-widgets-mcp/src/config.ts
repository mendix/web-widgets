import { readFileSync } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Server configuration
export const SERVER_NAME = "pluggable-widgets-mcp";
export const PORT = parseInt(process.env.PORT || "3100", 10);

// Server metadata
export const SERVER_ICON = {
    src: "https://avatars.githubusercontent.com/u/133443?s=200&v=4",
    sizes: ["128x128"],
    mimeType: "image/png"
};
export const SERVER_WEBSITE_URL = "https://github.com/mendix/web-widgets";
export const SERVER_INSTRUCTIONS = `This is a MCP server for Mendix Pluggable Widgets. It allows you to create, build, and deploy widgets to a Mendix project.

WORKFLOW GUIDE:
1. Call get-project-info first to discover the configured Mendix project directory.
2. If a project is configured, you can scaffold, build, and deploy widgets without asking for filesystem paths.
3. If no project is configured, use set-project-directory to configure one, or proceed without deployment.
4. Use create-widget to scaffold a new widget (output goes to the generations/ directory).
5. Use build-widget to compile the widget and produce an .mpk file.
6. Use deploy-widget to copy the .mpk to the project's widgets/ folder.

IMPORTANT: Do NOT ask the user for filesystem paths — use get-project-info to discover the project context automatically.`;

// Paths - use fileURLToPath for Node.js 18 compatibility (import.meta.dirname requires Node 20.11+)
const __dirname = import.meta.dirname ?? dirname(fileURLToPath(import.meta.url));
export const PACKAGE_ROOT = join(__dirname, "../");
export const GENERATIONS_DIR = join(process.cwd(), "generations");

const _pkg = JSON.parse(readFileSync(join(PACKAGE_ROOT, "package.json"), "utf-8")) as { version: string };
export const SERVER_VERSION = _pkg.version;

// Path to local docs folder
export const DOCS_DIR = join(PACKAGE_ROOT, "docs");

// Timeouts
export const SCAFFOLD_TIMEOUT_MS = 300000; // 5 minutes

// Project directory configuration
export const MENDIX_PROJECT_DIR = process.env.MENDIX_PROJECT_DIR ? resolve(process.env.MENDIX_PROJECT_DIR) : undefined;

export interface ProjectValidation {
    valid: boolean;
    projectDir: string;
    projectName?: string;
    widgetsDir: string;
    existingWidgets: string[];
    error?: string;
}

/**
 * Validates a Mendix project directory.
 * Checks that it exists and contains a .mpr file.
 * Returns the project name and list of existing .mpk widgets.
 */
export async function validateProjectDir(dir: string): Promise<ProjectValidation> {
    const widgetsDir = join(dir, "widgets");

    try {
        await stat(dir);
    } catch {
        return {
            valid: false,
            projectDir: dir,
            widgetsDir,
            existingWidgets: [],
            error: `Directory does not exist: ${dir}`
        };
    }

    let projectName: string | undefined;
    try {
        const entries = await readdir(dir);
        const mprFile = entries.find(entry => entry.endsWith(".mpr"));
        if (!mprFile) {
            return {
                valid: false,
                projectDir: dir,
                widgetsDir,
                existingWidgets: [],
                error: `No .mpr file found in ${dir}. This does not appear to be a Mendix project directory.`
            };
        }
        projectName = mprFile.replace(/\.mpr$/, "");
    } catch {
        return {
            valid: false,
            projectDir: dir,
            widgetsDir,
            existingWidgets: [],
            error: `Failed to read directory: ${dir}`
        };
    }

    let existingWidgets: string[] = [];
    try {
        const entries = await readdir(widgetsDir);
        existingWidgets = entries.filter(entry => entry.endsWith(".mpk"));
    } catch {
        // widgets/ dir may not exist yet — that's fine
    }

    return { valid: true, projectDir: dir, projectName, widgetsDir, existingWidgets };
}
