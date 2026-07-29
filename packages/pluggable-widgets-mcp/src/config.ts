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
/**
 * Sent once at initialize. This is the single place the widget workflow is described — tool
 * descriptions say what each tool does, not what to call next, so the sequence is stated once
 * rather than duplicated across descriptions and response bodies.
 */
export const SERVER_INSTRUCTIONS = `MCP server for building Mendix pluggable widgets.

Workflow:
  1. get-project-info        Discover the open Mendix project.
  2. create-widget           Scaffold into {project}/widget-sources/.
  3. set-widget-properties   Write the widget's XML from a property model.
  4. write-widget-file       Write the .tsx and .scss yourself.
  5. build-widget            Compile to .mpk.
  6. deploy-widget           Copy the .mpk into the project's widgets/ folder.

Read these resources before writing component source:
  mendix://guidelines/property-types    property model schema
  mendix://guidelines/widget-patterns   component templates per widget archetype

The server generates XML because that is mechanically derivable from the property model. Component
source is yours to write.

Every path must resolve inside the configured project directory. Do not ask the user for filesystem
paths — call get-project-info instead. If no project is configured, call set-project-directory.`;

// Paths are derived from this module's location, never from process.cwd(). The server runs as a
// child process of Mendix Studio Pro, whose cwd is its own install directory — often read-only.
const __dirname = import.meta.dirname ?? dirname(fileURLToPath(import.meta.url));
export const PACKAGE_ROOT = join(__dirname, "../");

export const SERVER_VERSION = readServerVersion();

function readServerVersion(): string {
    try {
        const pkg = JSON.parse(readFileSync(join(PACKAGE_ROOT, "package.json"), "utf-8")) as { version?: string };
        return pkg.version ?? "0.0.0";
    } catch {
        // A missing package.json must not take down module evaluation.
        return "0.0.0";
    }
}

// Path to local docs folder
export const DOCS_DIR = join(PACKAGE_ROOT, "docs");

// Timeouts
// Scaffolding runs in-process and only renders templates to disk, so it is fast; the long pole is
// installing the new widget's dependencies, which is a separate step with its own budget.
export const SCAFFOLD_TIMEOUT_MS = 60000; // 1 minute
export const INSTALL_TIMEOUT_MS = 300000; // 5 minutes
export const BUILD_TIMEOUT_MS = 300000; // 5 minutes

/**
 * The Mendix project directory Studio Pro passed at spawn, if any.
 *
 * Read on call rather than captured at module load, so nothing holds a stale copy — the live value
 * is whatever the session state says, which `set-project-directory` can re-point.
 */
export function getConfiguredProjectDir(): string | undefined {
    return process.env.MENDIX_PROJECT_DIR ? resolve(process.env.MENDIX_PROJECT_DIR) : undefined;
}

/** Widget sources live inside the project, alongside the `widgets/` folder builds deploy into. */
export function widgetSourcesDir(projectDir: string): string {
    return join(projectDir, "widget-sources");
}

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
        // Sorted so the choice is deterministic rather than dependent on readdir order.
        const mprFiles = entries.filter(entry => entry.endsWith(".mpr")).sort();
        if (mprFiles.length > 1) {
            return {
                valid: false,
                projectDir: dir,
                widgetsDir,
                existingWidgets: [],
                error: `Multiple .mpr files found in ${dir} (${mprFiles.join(", ")}). Point at a directory containing exactly one Mendix project.`
            };
        }
        const mprFile = mprFiles[0];
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
