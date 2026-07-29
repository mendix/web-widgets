import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { INSTALL_TIMEOUT_MS, SCAFFOLD_TIMEOUT_MS } from "@/config";
import { DEFAULT_WIDGET_OPTIONS, type WidgetOptions, type WidgetOptionsInput } from "@/tools/types";
import { AnswerAdapter, type Answers } from "./answer-adapter";
import { createLogger } from "./logger";
import { ProgressTracker } from "./progress-tracker";

const installLog = createLogger("npm install");

/**
 * Progress milestones for widget scaffolding.
 */
export const SCAFFOLD_PROGRESS = {
    START: 0,
    INSTALLING: 50,
    COMPLETE: 100
} as const;

/** Namespace the Mendix generator is registered under inside our Yeoman environment. */
const GENERATOR_NAMESPACE = "@mendix/widget";

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
 * Maps our options onto the generator's prompt names.
 *
 * These keys are the generator's contract, not ours — they come from
 * `@mendix/generator-widget/generators/app/lib/prompttexts.js`. `generator.test.ts` pins the full
 * set so an upstream rename fails loudly instead of silently falling back to a default.
 *
 * `copyright` is deliberately omitted: the generator's own default computes the current year, which
 * is more correct than anything we can hardcode.
 */
export function buildGeneratorAnswers(options: WidgetOptions, projectPath: string): Answers {
    return {
        name: options.name,
        description: options.description,
        organization: options.organization,
        license: options.license,
        version: options.version,
        author: options.author,
        projectPath,
        programmingLanguage: options.programmingLanguage,
        programmingStyle: "function",
        platform: "web",
        boilerplate: options.template,
        hasUnitTests: options.unitTests,
        hasE2eTests: options.e2eTests
    };
}

export interface ScaffoldResult {
    /** Prompt names the generator asked for, in order. */
    askedFor: string[];
}

/**
 * Thrown when the generator exceeds its time budget.
 *
 * A distinct type rather than a message the caller has to recognise by substring — categorising an
 * error by `message.includes(...)` is the same guesswork this module exists to remove.
 */
export class ScaffoldTimeoutError extends Error {
    constructor(public readonly timeoutMs: number) {
        super(`Widget scaffold timed out after ${timeoutMs / 1000}s`);
        this.name = "ScaffoldTimeoutError";
    }
}

/**
 * Scaffolds a widget by running the Mendix generator in-process through a Yeoman environment
 * whose I/O adapter answers prompts from data.
 *
 * `widgetDir` must be a fresh, empty directory. That is not just tidiness: the generator's `end()`
 * hook spawns `pluggable-widgets-tools audit:fix`, `npm run lint:fix` and `npm run build` with
 * `stdio: "inherit"` when it finds a populated `node_modules`, which would write directly into the
 * MCP stdio channel. Scaffolding into an empty directory makes that branch unreachable — the
 * generator's own `initializing()` refuses a non-empty target first.
 *
 * Dependencies are NOT installed here; call `runNpmInstall` separately so a registry failure does
 * not discard a perfectly good scaffold.
 */
export async function runWidgetGenerator(
    options: WidgetOptions,
    tracker: ProgressTracker,
    widgetDir: string,
    projectPath = "../"
): Promise<ScaffoldResult> {
    // Imported lazily: yeoman-environment pulls in a large dependency graph, and the STDIO
    // transport should not pay for it unless a widget is actually being scaffolded.
    const { createEnv } = await import("yeoman-environment");

    // Yeoman drives this callback from `adapter.progress()`, so scaffold steps reach the client's
    // log panel as structured events rather than as text we would otherwise have to scrape.
    const adapter = new AnswerAdapter(
        buildGeneratorAnswers(options, projectPath),
        step => {
            tracker.info(step).catch(() => undefined);
        },
        "create-widget"
    );

    const env = createEnv({
        adapter: adapter as never,
        cwd: widgetDir
    });

    const require = createRequire(import.meta.url);
    env.register(require.resolve("@mendix/generator-widget/generators/app/index.js"), {
        namespace: GENERATOR_NAMESPACE
    });

    tracker.start("scaffolding");

    const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new ScaffoldTimeoutError(SCAFFOLD_TIMEOUT_MS)), SCAFFOLD_TIMEOUT_MS).unref()
    );

    try {
        await Promise.race([env.run(GENERATOR_NAMESPACE, { skipInstall: true }), timeout]);
        return { askedFor: adapter.askedFor };
    } finally {
        tracker.stop();
    }
}

export interface InstallResult {
    ok: boolean;
    /** Populated only when `ok` is false. */
    error?: string;
}

/**
 * Installs the scaffolded widget's dependencies.
 *
 * Reported separately from scaffolding because the failure modes differ: a bad answer fails in
 * milliseconds and leaves nothing behind, whereas a registry stall leaves a valid scaffold the user
 * can finish by hand. This resolves rather than throws so the caller can report partial success.
 */
export async function runNpmInstall(widgetDir: string, tracker: ProgressTracker): Promise<InstallResult> {
    return new Promise<InstallResult>(resolve => {
        tracker.updateStep("installing", 2);
        tracker.progress(SCAFFOLD_PROGRESS.INSTALLING, "Installing dependencies...").catch(() => undefined);

        let stderr = "";

        const child = spawn("npm", ["install"], {
            cwd: widgetDir,
            env: { ...process.env, FORCE_COLOR: "0", NO_COLOR: "1", DO_NOT_TRACK: "1" },
            stdio: ["ignore", "pipe", "pipe"]
        });

        // Both child streams go to stderr — stdout belongs to the MCP protocol.
        child.stdout.on("data", (data: Buffer) => installLog.debug(data.toString().trim()));
        child.stderr.on("data", (data: Buffer) => {
            const chunk = data.toString();
            stderr += chunk;
            installLog.debug(chunk.trim());
        });

        const timer = setTimeout(() => {
            child.kill();
            resolve({ ok: false, error: `npm install timed out after ${INSTALL_TIMEOUT_MS / 1000}s` });
        }, INSTALL_TIMEOUT_MS);

        child.on("close", (code: number | null) => {
            clearTimeout(timer);
            resolve(
                code === 0
                    ? { ok: true }
                    : { ok: false, error: `npm install exited with code ${code}\n${stderr.slice(-2000)}` }
            );
        });

        child.on("error", (err: Error) => {
            clearTimeout(timer);
            resolve({ ok: false, error: `Failed to spawn npm install: ${err.message}` });
        });
    });
}
