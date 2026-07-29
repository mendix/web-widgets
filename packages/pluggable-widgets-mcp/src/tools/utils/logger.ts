/**
 * Diagnostic logging for the server itself.
 *
 * Everything goes to **stderr**, never stdout: under the STDIO transport stdout carries the MCP
 * JSON-RPC stream, and a single stray write corrupts the protocol. Studio Pro captures the child
 * process's stderr, so that stream is the support log — there is no log file to manage.
 *
 * This is distinct from `notifications.ts`, which sends `notifications/message` to the *client*.
 * Rule of thumb: if the model or the user should see it, it is a notification; if it exists to
 * explain the server's own behaviour after the fact, it is a log.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_ORDER: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

/** `MCP_LOG_LEVEL=debug` to see everything; defaults to info. */
function configuredLevel(): number {
    const configured = process.env.MCP_LOG_LEVEL as LogLevel | undefined;
    return LEVEL_ORDER[configured ?? "info"] ?? LEVEL_ORDER.info;
}

export interface Logger {
    debug(message: string): void;
    info(message: string): void;
    warn(message: string): void;
    error(message: string): void;
}

/**
 * Creates a logger tagged with its subsystem, e.g. `createLogger("build")` emits `[build] …`.
 */
export function createLogger(tag: string): Logger {
    const write = (level: LogLevel, message: string): void => {
        if (LEVEL_ORDER[level] < configuredLevel()) {
            return;
        }
        // console.error writes to stderr for every level — the level is a filter, not a stream.
        console.error(level === "info" ? `[${tag}] ${message}` : `[${tag}:${level}] ${message}`);
    };

    return {
        debug: message => write("debug", message),
        info: message => write("info", message),
        warn: message => write("warn", message),
        error: message => write("error", message)
    };
}
