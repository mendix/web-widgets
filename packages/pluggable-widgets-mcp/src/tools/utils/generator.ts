import * as pty from "node-pty";
import { GENERATIONS_DIR, SCAFFOLD_TIMEOUT_MS } from "@/config";
import { DEFAULT_WIDGET_OPTIONS, type WidgetOptions, type WidgetOptionsInput } from "@/tools/types";
import { ProgressTracker } from "./progress-tracker";

// Re-export for backward compatibility with existing imports
export { DEFAULT_WIDGET_OPTIONS };

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
 * Buffer size for prompt detection in terminal output.
 * Increased from 500 to improve reliability with terminal buffering.
 */
const PROMPT_DETECTION_BUFFER_SIZE = 1000;

/**
 * Delay between sending answers to allow terminal to process.
 */
const ANSWER_SEND_DELAY_MS = 200;

/**
 * Local state for tracking generator process progress.
 */
interface GeneratorLocalState {
    output: string;
    answerIndex: number;
    promptMatchedIndex: number;
    allPromptsAnswered: boolean;
    lastActivityTime: number;
}

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
 * Arrow key escape sequence for navigating interactive prompts.
 */
const ARROW_DOWN = "\x1b[B";

/**
 * Maps programming language option to the key sequence needed.
 * TypeScript is the first option (just Enter), JavaScript needs arrow down first.
 */
function getLanguageKeySequence(language: "typescript" | "javascript"): string {
    return language === "javascript" ? ARROW_DOWN : "";
}

/**
 * Builds the answers array for the generator prompts.
 * @param options - Fully resolved widget options (all fields required)
 * @param outputDir - Output directory (used for project path calculation)
 */
export function buildGeneratorAnswers(options: WidgetOptions, outputDir?: string): string[] {
    // Calculate relative project path from widget folder to parent directory
    const projectPath = outputDir ? "../" : "../";

    return [
        "", // Widget name - already passed as CLI arg
        options.description,
        options.organization,
        "© Mendix Technology BV 2025", // Copyright
        options.license,
        options.version,
        options.author,
        projectPath, // Project path (relative to widget folder)
        getLanguageKeySequence(options.programmingLanguage), // Programming language selection
        "", // Component type - Enter for Function Components (default)
        "", // Platform - Enter for web (default)
        options.template,
        options.unitTests ? "yes" : "no",
        options.e2eTests ? "yes" : "no"
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
 * Uses a larger buffer and improved logging for reliability.
 */
function handleGeneratorOutput(
    state: GeneratorLocalState,
    tracker: ProgressTracker,
    sendNextAnswer: () => void,
    onAllPromptsAnswered: () => void
): void {
    // Update activity timestamp for stuck detection
    state.lastActivityTime = Date.now();

    if (state.answerIndex < GENERATOR_PROMPTS.length) {
        // Skip if we've already matched this prompt
        if (state.promptMatchedIndex >= state.answerIndex) {
            return;
        }

        const expectedPattern = GENERATOR_PROMPTS[state.answerIndex];
        const recentOutput = state.output.slice(-PROMPT_DETECTION_BUFFER_SIZE).toLowerCase();

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

            setTimeout(sendNextAnswer, ANSWER_SEND_DELAY_MS);
        } else {
            // Debug logging for unmatched prompts (only log occasionally to avoid spam)
            const cleanedRecent = cleanTerminalOutput(recentOutput.slice(-200));
            if (cleanedRecent.length > 0 && state.output.length % 500 < 50) {
                console.error(
                    `[create-widget] Waiting for prompt "${expectedPattern}" (index ${state.answerIndex}), recent: "${cleanedRecent.slice(-100)}"`
                );
            }
        }
    } else {
        onAllPromptsAnswered();
    }
}

/**
 * Runs the Mendix widget generator using node-pty for terminal interaction.
 * @param options - Widget configuration options
 * @param tracker - Progress tracker for notifications
 * @param outputDir - Directory where the widget will be created (defaults to GENERATIONS_DIR)
 */
export function runWidgetGenerator(
    options: WidgetOptions,
    tracker: ProgressTracker,
    outputDir: string = GENERATIONS_DIR
): Promise<string> {
    const answers = buildGeneratorAnswers(options, outputDir);

    return new Promise((resolve, reject) => {
        const state: GeneratorLocalState = {
            output: "",
            answerIndex: 0,
            promptMatchedIndex: -1,
            allPromptsAnswered: false,
            lastActivityTime: Date.now()
        };

        tracker.start("initializing");

        const ptyProcess = pty.spawn("npx", ["@mendix/generator-widget", options.name], {
            name: "xterm-color",
            cols: 120,
            rows: 30,
            cwd: outputDir,
            env: { ...process.env, FORCE_COLOR: "0" }
        });

        const sendNextAnswer = (): void => {
            if (state.answerIndex < answers.length) {
                const answer = answers[state.answerIndex];
                const displayAnswer =
                    answer === "" ? "(Enter)" : answer.startsWith("\x1b") ? "(Arrow+Enter)" : `"${answer}"`;
                const idx = state.answerIndex + 1;
                console.error(`[create-widget] [${idx}/${answers.length}] Sending: ${displayAnswer}`);
                state.answerIndex++;
                ptyProcess.write(answer + "\r");
            }
        };

        // Stuck detection: if no progress for 30 seconds, try resending current answer
        const stuckCheckInterval = setInterval(() => {
            const timeSinceActivity = Date.now() - state.lastActivityTime;
            if (timeSinceActivity > 30000 && !state.allPromptsAnswered && state.answerIndex > 0) {
                console.error(
                    `[create-widget] No progress for ${Math.round(timeSinceActivity / 1000)}s at step ${state.answerIndex}, retrying...`
                );
                // Resend Enter to potentially unstick the process
                ptyProcess.write("\r");
                state.lastActivityTime = Date.now();
            }
        }, 10000);

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
            clearInterval(stuckCheckInterval);
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
            clearInterval(stuckCheckInterval);
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
