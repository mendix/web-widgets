import * as pty from "node-pty";
import { GENERATIONS_DIR, SCAFFOLD_TIMEOUT_MS } from "@/config";
import type { WidgetOptions } from "@/tools/types";
import { ProgressTracker } from "./progress-tracker";

/**
 * Generator prompt patterns in order - must match answers array.
 */
export const GENERATOR_PROMPTS = [
    "What is the name",
    "Enter a description",
    "organization",
    "copyright",
    "license",
    "version",
    "author",
    "path",
    "programming language",
    "type of components",
    "type of widget",
    "template",
    "unit tests",
    "end-to-end"
] as const;

/**
 * Progress milestones for widget scaffolding.
 */
export const SCAFFOLD_PROGRESS = {
    START: 0,
    PROMPTS_START: 5,
    PROMPTS_END: 70,
    INSTALLING: 75,
    COMPLETE: 100
} as const;

/**
 * Default values for widget options.
 */
export const DEFAULT_WIDGET_OPTIONS = {
    version: "1.0.0",
    author: "Mendix",
    license: "Apache-2.0",
    organization: "Mendix",
    template: "empty" as const,
    programmingLanguage: "typescript" as const,
    unitTests: true,
    e2eTests: false
} as const;

/**
 * Local state for tracking generator process progress.
 */
interface GeneratorLocalState {
    output: string;
    answerIndex: number;
    promptMatchedIndex: number;
    allPromptsAnswered: boolean;
}

/**
 * Builds widget options from input arguments with defaults applied.
 */
export function buildWidgetOptions(
    args: Partial<WidgetOptions> & Pick<WidgetOptions, "name" | "description">
): WidgetOptions {
    return {
        name: args.name,
        description: args.description,
        version: args.version ?? DEFAULT_WIDGET_OPTIONS.version,
        author: args.author ?? DEFAULT_WIDGET_OPTIONS.author,
        license: args.license ?? DEFAULT_WIDGET_OPTIONS.license,
        organization: args.organization ?? DEFAULT_WIDGET_OPTIONS.organization,
        template: args.template ?? DEFAULT_WIDGET_OPTIONS.template,
        programmingLanguage: DEFAULT_WIDGET_OPTIONS.programmingLanguage,
        unitTests: args.unitTests ?? DEFAULT_WIDGET_OPTIONS.unitTests,
        e2eTests: args.e2eTests ?? DEFAULT_WIDGET_OPTIONS.e2eTests
    };
}

/**
 * Builds the answers array for the generator prompts.
 */
export function buildGeneratorAnswers(options: WidgetOptions): string[] {
    return [
        "", // Widget name - already passed as CLI arg
        options.description,
        options.organization ?? DEFAULT_WIDGET_OPTIONS.organization,
        "© Mendix Technology BV 2025", // Copyright
        options.license,
        options.version,
        options.author,
        "../", // Project path (relative to widget folder inside generations/)
        "", // Programming language - Enter for TypeScript (default)
        "", // Component type - Enter for Function Components (default)
        "", // Platform - Enter for web (default)
        options.template ?? DEFAULT_WIDGET_OPTIONS.template,
        options.unitTests !== false ? "yes" : "no",
        options.e2eTests === true ? "yes" : "no"
    ];
}

/**
 * Calculates progress percentage for a given prompt index.
 */
export function calculatePromptProgress(promptIndex: number): number {
    const progressRange = SCAFFOLD_PROGRESS.PROMPTS_END - SCAFFOLD_PROGRESS.PROMPTS_START;
    const promptProgress = (promptIndex / GENERATOR_PROMPTS.length) * progressRange;
    return Math.round(SCAFFOLD_PROGRESS.PROMPTS_START + promptProgress);
}

/**
 * Removes ANSI escape codes and spinner characters from terminal output.
 */
export function cleanTerminalOutput(data: string): string {
    return (
        data
            // eslint-disable-next-line no-control-regex -- Intentionally matching ANSI escape sequences
            .replace(/\x1b\[[0-9;]*[a-zA-Z]/g, "")
            .replace(/[⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏]/g, "")
            .replace(/[\r\n]+/g, " ")
            .replace(/\[[\dD\dC\dK\dG]+/g, "")
            .trim()
    );
}

/**
 * Handles generator output and sends answers when prompts are detected.
 */
function handleGeneratorOutput(
    state: GeneratorLocalState,
    tracker: ProgressTracker,
    sendNextAnswer: () => void,
    onAllPromptsAnswered: () => void
): void {
    if (state.answerIndex < GENERATOR_PROMPTS.length) {
        // Skip if we've already matched this prompt
        if (state.promptMatchedIndex >= state.answerIndex) {
            return;
        }

        const expectedPattern = GENERATOR_PROMPTS[state.answerIndex];
        const recentOutput = state.output.slice(-500).toLowerCase();

        if (recentOutput.includes(expectedPattern.toLowerCase())) {
            state.promptMatchedIndex = state.answerIndex;
            tracker.updateStep(expectedPattern, state.answerIndex + 1);

            const progress = calculatePromptProgress(state.answerIndex + 1);
            const message = `Configuring: ${expectedPattern}`;

            tracker.progress(progress, message).catch(() => undefined);
            tracker
                .info(message, {
                    step: expectedPattern,
                    promptIndex: state.answerIndex + 1,
                    totalPrompts: GENERATOR_PROMPTS.length
                })
                .catch(() => undefined);

            setTimeout(sendNextAnswer, 150);
        }
    } else {
        onAllPromptsAnswered();
    }
}

/**
 * Runs the Mendix widget generator using node-pty for terminal interaction.
 */
export function runWidgetGenerator(options: WidgetOptions, tracker: ProgressTracker): Promise<string> {
    const answers = buildGeneratorAnswers(options);

    return new Promise((resolve, reject) => {
        const state: GeneratorLocalState = {
            output: "",
            answerIndex: 0,
            promptMatchedIndex: -1,
            allPromptsAnswered: false
        };

        tracker.start("initializing");

        const ptyProcess = pty.spawn("npx", ["@mendix/generator-widget", options.name], {
            name: "xterm-color",
            cols: 120,
            rows: 30,
            cwd: GENERATIONS_DIR,
            env: { ...process.env, FORCE_COLOR: "0" }
        });

        const sendNextAnswer = (): void => {
            if (state.answerIndex < answers.length) {
                const answer = answers[state.answerIndex];
                const displayAnswer = answer === "" ? "(Enter)" : `"${answer}"`;
                const idx = state.answerIndex + 1;
                console.error(`[create-widget] [${idx}/${answers.length}] Sending: ${displayAnswer}`);
                state.answerIndex++;
                ptyProcess.write(answer + "\r");
            }
        };

        ptyProcess.onData(data => {
            state.output += data;
            handleGeneratorOutput(state, tracker, sendNextAnswer, () => {
                if (!state.allPromptsAnswered) {
                    state.allPromptsAnswered = true;
                    tracker.updateStep("installing", GENERATOR_PROMPTS.length);
                    tracker.markComplete();
                    console.error("[create-widget] Installing dependencies...");
                    tracker.progress(SCAFFOLD_PROGRESS.INSTALLING, "Installing dependencies...").catch(() => undefined);
                    tracker.info("Installing dependencies...").catch(() => undefined);
                }
            });
        });

        ptyProcess.onExit(({ exitCode }) => {
            tracker.stop();
            if (exitCode === 0) {
                const widgetFolder = `${options.name.toLowerCase()}-web`;
                console.error(`[create-widget] Widget scaffolded successfully: ${widgetFolder}`);
                resolve(widgetFolder);
            } else {
                console.error(`[create-widget] Widget scaffold failed with exit code ${exitCode}`);
                const cleanOutput = cleanTerminalOutput(state.output);
                tracker
                    .error(`Scaffold failed with exit code ${exitCode}`, {
                        lastOutput: cleanOutput.slice(-500)
                    })
                    .catch(() => undefined);
                reject(new Error(`Generator exited with code ${exitCode}\nOutput: ${cleanOutput.slice(-2000)}`));
            }
        });

        const timeout = setTimeout(() => {
            tracker.stop();
            console.error("[create-widget] Widget scaffold timed out after 5 minutes");
            tracker
                .error("Widget scaffold timed out after 5 minutes", {
                    step: tracker.state.step,
                    stepIndex: tracker.state.stepIndex
                })
                .catch(() => undefined);
            ptyProcess.kill();
            reject(new Error("Widget scaffold timed out after 5 minutes"));
        }, SCAFFOLD_TIMEOUT_MS);

        ptyProcess.onExit(() => clearTimeout(timeout));
    });
}
