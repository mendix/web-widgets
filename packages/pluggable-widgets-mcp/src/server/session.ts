import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { randomUUID } from "node:crypto";

export interface Session {
    transport: StreamableHTTPServerTransport;
    createdAt: Date;
}

/**
 * Manages MCP sessions and their associated transports.
 */
export class SessionManager {
    private sessions = new Map<string, Session>();

    /**
     * Creates a new transport with session lifecycle callbacks.
     * The transport is added to sessions when initialized via the callback.
     */
    createTransport(): StreamableHTTPServerTransport {
        const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => randomUUID(),
            onsessioninitialized: sessionId => {
                this.sessions.set(sessionId, {
                    transport,
                    createdAt: new Date()
                });
                console.log(`[MCP] Session initialized: ${sessionId}`);
            },
            onsessionclosed: sessionId => {
                this.sessions.delete(sessionId);
                console.log(`[MCP] Session closed: ${sessionId}`);
            }
        });

        return transport;
    }

    /**
     * Gets an existing session's transport by session ID.
     */
    getTransport(sessionId: string): StreamableHTTPServerTransport | undefined {
        return this.sessions.get(sessionId)?.transport;
    }

    /**
     * Checks if a session exists.
     */
    hasSession(sessionId: string): boolean {
        return this.sessions.has(sessionId);
    }

    /**
     * Gets the count of active sessions.
     */
    get sessionCount(): number {
        return this.sessions.size;
    }

    /**
     * Closes all sessions gracefully.
     */
    async closeAll(): Promise<void> {
        const closePromises = Array.from(this.sessions.entries()).map(async ([sessionId, session]) => {
            try {
                console.log(`[MCP] Closing session: ${sessionId}`);
                await session.transport.close();
            } catch (error) {
                console.error(`[MCP] Error closing session ${sessionId}:`, error);
            }
        });

        await Promise.all(closePromises);
        this.sessions.clear();
    }
}

export const sessionManager = new SessionManager();
