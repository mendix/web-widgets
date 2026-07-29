import type { ToolResponse } from "@/tools/types";

/**
 * Tool responses: exactly two constructors.
 *
 * There were previously three, plus one raw object literal that bypassed all of them, and the codes
 * below were declared up front "in case" — six of fourteen were never emitted anywhere. Every code
 * here is produced by at least one tool, and every failure path goes through `fail`, so `isError` is
 * never forgotten.
 */

/**
 * Machine-readable failure categories. Clients can branch on these; the text is for the model.
 */
export type ErrorCode =
    /** No Mendix project configured, or the configured one is invalid. */
    | "ERR_PROJECT_NOT_CONFIGURED"
    /** A path resolves outside the project sandbox. */
    | "ERR_OUTPUT_PATH_INVALID"
    /** A required file or directory does not exist. */
    | "ERR_NOT_FOUND"
    /** The widget generator failed. */
    | "ERR_SCAFFOLD_FAILED"
    /** The widget generator exceeded its time budget. */
    | "ERR_SCAFFOLD_TIMEOUT"
    /** The property model is not a valid widget definition. */
    | "ERR_INVALID_DEFINITION"
    /** Reading a widget file failed. */
    | "ERR_FILE_READ"
    /** Writing a widget file failed. */
    | "ERR_FILE_WRITE"
    /** The build produced errors, or exited non-zero. */
    | "ERR_BUILD_FAILED"
    /** No .mpk found — the widget has not been built. */
    | "ERR_MPK_NOT_FOUND"
    /** Copying the .mpk into the project failed. */
    | "ERR_DEPLOY_FAILED";

/** Optional context attached to a failure. */
export interface FailureContext {
    /** What the caller should do about it. */
    suggestion?: string;
    file?: string;
    line?: number;
    column?: number;
    /** Raw tool output, truncated in the rendered message. */
    details?: string;
}

/** Raw output beyond this is noise for the model and cost for the caller. */
const MAX_DETAIL_CHARS = 500;

/** A successful tool result. */
export function ok(text: string): ToolResponse {
    return { content: [{ type: "text", text }] };
}

/**
 * A failed tool result.
 *
 * The code is rendered into the text as `[ERR_…]` so it survives the MCP text channel, which is all
 * the model ever sees.
 */
export function fail(code: ErrorCode, message: string, context: FailureContext = {}): ToolResponse {
    const lines = [`[${code}] ${message}`];

    const location = formatLocation(context);
    if (location) {
        lines.push(`File: ${location}`);
    }
    if (context.suggestion) {
        lines.push(`Suggestion: ${context.suggestion}`);
    }
    if (context.details) {
        lines.push("Details:", truncate(context.details));
    }

    return { content: [{ type: "text", text: lines.join("\n") }], isError: true };
}

function formatLocation({ file, line, column }: FailureContext): string | undefined {
    if (!file) {
        return undefined;
    }
    // Column was previously dropped whenever it appeared without a line.
    return [file, line, column].filter(part => part !== undefined).join(":");
}

function truncate(text: string): string {
    return text.length > MAX_DETAIL_CHARS ? `${text.slice(0, MAX_DETAIL_CHARS)}...(truncated)` : text;
}
