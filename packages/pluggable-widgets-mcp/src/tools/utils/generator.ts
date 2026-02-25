import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { GENERATIONS_DIR, PACKAGE_ROOT, SCAFFOLD_TIMEOUT_MS } from "@/config";
import { DEFAULT_WIDGET_OPTIONS, type WidgetOptions, type WidgetOptionsInput } from "@/tools/types";
import { ProgressTracker } from "./progress-tracker";

// Re-export for backward compatibility with existing imports
export { DEFAULT_WIDGET_OPTIONS };

/**
 * Progress milestones for widget scaffolding.
 */
export const SCAFFOLD_PROGRESS = {
    START: 0,
    INSTALLING: 50,
    COMPLETE: 100
} as const;

/**
 * Builds widget options from input arguments with defaults applied.
 * Takes the schema-validated input (with optional fields) and returns
 * fully resolved options (all fields required).
 */
export function buildWidgetOptions(args: WidgetOptionsInput): WidgetOptions {
    return {
        name: args.name,
        description: args.description,
        version: args.version ?? DEFAULT_WIDGET_OPTIONS.version,
        author: args.author ?? DEFAULT_WIDGET_OPTIONS.author,
        license: args.license ?? DEFAULT_WIDGET_OPTIONS.license,
        organization: args.organization ?? DEFAULT_WIDGET_OPTIONS.organization,
        template: args.template ?? DEFAULT_WIDGET_OPTIONS.template,
        programmingLanguage: args.programmingLanguage ?? DEFAULT_WIDGET_OPTIONS.programmingLanguage,
        unitTests: args.unitTests ?? DEFAULT_WIDGET_OPTIONS.unitTests,
        e2eTests: args.e2eTests ?? DEFAULT_WIDGET_OPTIONS.e2eTests
    };
}

/**
 * Returns the path to the generator-widget binary installed in this package's node_modules.
 * Using a direct path (rather than npx) ensures we always use the correct version
 * regardless of the spawn cwd (which is set to outputDir for widget placement).
 */
function getGeneratorBinPath(): string {
    return resolve(PACKAGE_ROOT, "node_modules/.bin/generator-widget");
}

/**
 * Maps WidgetOptions to CLI flags for the non-interactive generator.
 * Requires @mendix/generator-widget with --default flag support (commit 16cf75e).
 */
function buildWidgetFlags(options: WidgetOptions): string[] {
    return [
        "--default",
        "--description",
        options.description,
        "--organization",
        options.organization,
        "--copyright",
        "© Mendix Technology BV 2026",
        "--license",
        options.license,
        "--version",
        options.version,
        "--author",
        options.author,
        "--projectPath",
        "../",
        "--programmingLanguage",
        options.programmingLanguage,
        "--programmingStyle",
        "function",
        "--platform",
        "web",
        "--boilerplate",
        options.template,
        ...(options.unitTests ? ["--hasUnitTests"] : []),
        ...(options.e2eTests ? ["--hasE2eTests"] : [])
    ];
}

/**
 * Runs the Mendix widget generator using non-interactive CLI flags.
 * Replaces the previous node-pty / interactive-prompt approach.
 *
 * @param options - Widget configuration options
 * @param tracker - Progress tracker for notifications
 * @param outputDir - Directory where the widget folder will be created
 */
export async function runWidgetGenerator(
    options: WidgetOptions,
    tracker: ProgressTracker,
    outputDir: string = GENERATIONS_DIR
): Promise<void> {
    const flags = buildWidgetFlags(options);
    const generatorBin = getGeneratorBinPath();

    return new Promise((resolve, reject) => {
        tracker.start("initializing");

        let stdout = "";
        let stderr = "";
        let installingNotified = false;

        const child = spawn(generatorBin, [options.name, ...flags], {
            cwd: outputDir,
            env: { ...process.env, FORCE_COLOR: "0", NO_COLOR: "1", DO_NOT_TRACK: "1" },
            stdio: ["ignore", "pipe", "pipe"]
        });

        child.stdout.on("data", (data: Buffer) => {
            const chunk = data.toString();
            stdout += chunk;
            console.error(`[create-widget] stdout: ${chunk.trim()}`);

            if (!installingNotified && stdout.includes("npm install")) {
                installingNotified = true;
                tracker.updateStep("installing", 2);
                tracker.progress(SCAFFOLD_PROGRESS.INSTALLING, "Installing dependencies...").catch(() => undefined);
                tracker.info("Installing dependencies...").catch(() => undefined);
            }
        });

        child.stderr.on("data", (data: Buffer) => {
            const chunk = data.toString();
            stderr += chunk;
            console.error(`[create-widget] stderr: ${chunk.trim()}`);
        });

        const timeout = setTimeout(() => {
            tracker.stop();
            child.kill();
            reject(new Error("Widget scaffold timed out after 5 minutes"));
        }, SCAFFOLD_TIMEOUT_MS);

        child.on("close", (exitCode: number | null) => {
            clearTimeout(timeout);
            tracker.stop();

            if (exitCode === 0) {
                console.error(`[create-widget] Widget scaffolded successfully`);
                resolve();
            } else {
                console.error(`[create-widget] Widget scaffold failed with exit code ${exitCode}`);
                reject(
                    new Error(
                        `Generator exited with code ${exitCode}\nStderr: ${stderr.slice(-2000)}\nStdout: ${stdout.slice(-1000)}`
                    )
                );
            }
        });

        child.on("error", (err: Error) => {
            clearTimeout(timeout);
            tracker.stop();
            reject(new Error(`Failed to spawn generator: ${err.message}`));
        });
    });
}
