import { appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

export interface ProtocolLogEntry {
    timestamp: string;
    sessionId: string;
    direction: "incoming" | "outgoing";
    method?: string;
    id?: string | number | null;
    params?: unknown;
    result?: unknown;
    error?: unknown;
    duration?: number;
    clientCapabilities?: unknown;
    clientInfo?: unknown;
    protocolVersion?: string;
}

const LOG_DIR = join(process.cwd(), "mcp-session-logs");
let logDirCreated = false;

function ensureLogDir(): void {
    if (!logDirCreated) {
        mkdirSync(LOG_DIR, { recursive: true });
        logDirCreated = true;
    }
}

/**
 * Appends a JSON-lines log entry for the given session.
 * Writes to mcp-session-logs/<sessionId>.jsonl.
 * Uses synchronous I/O to keep the MCP stdio channel clean.
 */
export function logProtocolMessage(sessionId: string, entry: ProtocolLogEntry): void {
    try {
        ensureLogDir();
        const line = JSON.stringify(entry) + "\n";
        appendFileSync(join(LOG_DIR, `${sessionId}.jsonl`), line, "utf-8");
    } catch {
        // Never crash the server over a logging failure
    }
}

/**
 * Extracts a structured log entry from an incoming JSON-RPC request body.
 * Special-cases initialize requests to surface ClientCapabilities at the top level.
 */
export function buildIncomingLogEntry(sessionId: string, body: Record<string, unknown>): ProtocolLogEntry {
    const entry: ProtocolLogEntry = {
        timestamp: new Date().toISOString(),
        sessionId,
        direction: "incoming",
        method: typeof body.method === "string" ? body.method : undefined,
        id: (body.id as string | number | null | undefined) ?? undefined
    };

    const method = entry.method;

    if (method === "initialize") {
        const params = body.params as Record<string, unknown> | undefined;
        if (params) {
            entry.protocolVersion = params.protocolVersion as string | undefined;
            entry.clientInfo = params.clientInfo;
            entry.clientCapabilities = params.capabilities;
        }
    } else if (method === "tools/call") {
        const params = body.params as Record<string, unknown> | undefined;
        entry.params = params ? { name: params.name, arguments: params.arguments } : undefined;
    } else {
        // For other methods log params as-is (but omit large payloads)
        entry.params = body.params;
    }

    return entry;
}

/**
 * Builds a log entry for an outgoing response.
 */
export function buildOutgoingLogEntry(
    sessionId: string,
    method: string | undefined,
    id: string | number | null | undefined,
    result: unknown,
    error: unknown,
    duration: number
): ProtocolLogEntry {
    return {
        timestamp: new Date().toISOString(),
        sessionId,
        direction: "outgoing",
        method,
        id,
        result: error ? undefined : result,
        error,
        duration
    };
}
