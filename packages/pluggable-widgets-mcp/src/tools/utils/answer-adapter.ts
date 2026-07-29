/**
 * A Yeoman adapter that answers prompts from a supplied map instead of a TTY.
 *
 * Yeoman generators are interactive by design. Rather than simulating keystrokes or passing
 * generator-specific CLI flags, we replace the environment's I/O layer — the supported extension
 * point — so prompts are resolved from data.
 *
 * Two properties matter here:
 *
 * 1. Nothing is written to stdout. Under the STDIO transport stdout carries the MCP JSON-RPC
 *    stream, and the Mendix generator logs a large ASCII banner. All output goes to stderr.
 * 2. An unanswered prompt with no default throws. A generator that adds a prompt we don't know
 *    about must fail loudly rather than hang forever waiting on a TTY that isn't attached.
 */

import { createLogger } from "./logger";

/** The subset of an inquirer question the generator actually uses. */
interface PromptQuestion {
    name: string;
    message?: string;
    default?: unknown | ((answers: Answers) => unknown | Promise<unknown>);
    when?: boolean | ((answers: Answers) => boolean | Promise<boolean>);
    validate?: (input: unknown, answers: Answers) => boolean | string | Promise<boolean | string>;
}

export type Answers = Record<string, unknown>;

/** Categories `yeoman-environment` calls on `adapter.log`. */
const LOG_CATEGORIES = [
    "skip",
    "force",
    "create",
    "invoke",
    "conflict",
    "identical",
    "info",
    "added",
    "removed",
    "write",
    "writeln",
    "ok",
    "error"
] as const;

type LogCategory = (typeof LOG_CATEGORIES)[number];

type LogFn = ((...args: unknown[]) => LogFn) &
    Record<LogCategory, (...args: unknown[]) => LogFn> & {
        colored: (parts: Array<{ message: string }>) => LogFn;
    };

/**
 * Builds the chainable, category-bearing logger object Yeoman expects, backed by our own logger.
 *
 * The generator's file-by-file output is routine detail, so it logs at debug; only its `error`
 * category is surfaced by default.
 */
function createGeneratorLog(tag: string): LogFn {
    const logger = createLogger(tag);

    const write = (category: LogCategory | undefined, args: unknown[]): LogFn => {
        const text = args
            .map(argument => (typeof argument === "string" ? argument : JSON.stringify(argument)))
            .join(" ")
            .trimEnd();

        if (text) {
            const message = category ? `${category}: ${text}` : text;
            if (category === "error") {
                logger.error(message);
            } else {
                logger.debug(message);
            }
        }
        return generatorLog;
    };

    const generatorLog = ((...args: unknown[]) => write(undefined, args)) as LogFn;
    for (const category of LOG_CATEGORIES) {
        generatorLog[category] = (...args: unknown[]) => write(category, args);
    }
    generatorLog.colored = parts => write(undefined, [parts.map(part => part.message).join("")]);
    return generatorLog;
}

export class MissingAnswerError extends Error {
    constructor(
        public readonly promptName: string,
        message?: string
    ) {
        super(
            `The widget generator asked for "${promptName}" but no answer was supplied and it has no default.` +
                (message ? ` Prompt was: ${message}` : "")
        );
        this.name = "MissingAnswerError";
    }
}

export class InvalidAnswerError extends Error {
    constructor(
        public readonly promptName: string,
        public readonly reason: string
    ) {
        super(`The widget generator rejected the value for "${promptName}": ${reason}`);
        this.name = "InvalidAnswerError";
    }
}

/**
 * Implements the `QueuedAdapter` shape that `yeoman-environment` assigns straight onto
 * `env.adapter` — it does not wrap a plain adapter, so `queue` and `progress` must exist.
 */
export class AnswerAdapter {
    readonly log: LogFn;
    readonly signal: AbortSignal;

    /** Prompt names the generator asked for, in order. Used to pin the contract in tests. */
    readonly askedFor: string[] = [];

    private readonly abortController = new AbortController();

    constructor(
        private readonly answers: Answers,
        private readonly onStep?: (message: string) => void,
        tag = "generator"
    ) {
        this.log = createGeneratorLog(tag);
        this.signal = this.abortController.signal;
    }

    async prompt(questions: PromptQuestion | PromptQuestion[], initialAnswers: Answers = {}): Promise<Answers> {
        const list = Array.isArray(questions) ? questions : [questions];
        const resolved: Answers = { ...initialAnswers };

        for (const question of list) {
            if (!(await this.shouldAsk(question, resolved))) {
                continue;
            }

            this.askedFor.push(question.name);

            const answer = await this.resolveAnswer(question, resolved);
            if (answer === undefined) {
                throw new MissingAnswerError(question.name, question.message);
            }

            if (typeof question.validate === "function") {
                const verdict = await question.validate(answer, resolved);
                if (verdict !== true) {
                    throw new InvalidAnswerError(
                        question.name,
                        typeof verdict === "string" ? verdict : "invalid value"
                    );
                }
            }

            resolved[question.name] = answer;
        }

        return resolved;
    }

    /** Honours inquirer's `when` guard so conditional prompts aren't demanded. */
    private async shouldAsk(question: PromptQuestion, answers: Answers): Promise<boolean> {
        if (typeof question.when === "function") {
            return question.when(answers);
        }
        return question.when !== false;
    }

    /** Supplied answer wins; otherwise fall back to the prompt's own default. */
    private async resolveAnswer(question: PromptQuestion, answers: Answers): Promise<unknown> {
        if (this.answers[question.name] !== undefined) {
            return this.answers[question.name];
        }
        if (answers[question.name] !== undefined) {
            return answers[question.name];
        }
        return typeof question.default === "function" ? question.default(answers) : question.default;
    }

    async queue<T>(task: (adapter: AnswerAdapter) => T | PromiseLike<T>): Promise<T> {
        return task(this);
    }

    async progress<T>(task: (progress: { step: (prefix: string, message: string) => void }) => T): Promise<T> {
        return task({
            step: (prefix, message) => this.onStep?.(`${prefix} ${message}`.trim())
        });
    }

    close(): void {
        // No resources to release; the environment calls this on completion.
    }

    abort(reason?: unknown): void {
        this.abortController.abort(reason);
    }
}
