import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { SessionState } from "@/tools/session-state";

// ─── Protocol Recording Types ────────────────────────────────────────────────

export interface ProtocolRecord {
    timestamp: number;
    direction: "client-to-server" | "server-to-client";
    message: unknown;
}

export interface ToolCallRecord {
    name: string;
    arguments: unknown;
    timestamp: number;
}

export interface RecordingMcpTestContext extends McpTestContext {
    records: ProtocolRecord[];
    getToolCalls(): ToolCallRecord[];
    getToolCallSequence(): string[];
    assertToolOrder(expectedNames: string[]): void;
}

type ToolRegistrationFn = (server: McpServer, state: SessionState) => void;

interface McpTestContext {
    server: McpServer;
    client: Client;
    state: SessionState;
    cleanup: () => Promise<void>;
}

/**
 * Creates an MCP server + client pair connected via InMemoryTransport.
 * By default registers `registerProjectTools`; callers can pass custom registration functions.
 */
export function getResultText(result: Awaited<ReturnType<Client["callTool"]>>): string {
    if ("content" in result && Array.isArray(result.content)) {
        return result.content
            .filter((c): c is { type: "text"; text: string } => c.type === "text")
            .map(c => c.text)
            .join("\n");
    }
    return "";
}

export function isError(result: Awaited<ReturnType<Client["callTool"]>>): boolean {
    return "isError" in result && result.isError === true;
}

// ─── Core Test Context ────────────────────────────────────────────────────────

export async function createMcpTestContext(...registerFns: ToolRegistrationFn[]): Promise<McpTestContext> {
    const state: SessionState = { projectDir: undefined };

    const server = new McpServer(
        { name: "test-server", version: "0.0.0" },
        { capabilities: { tools: {}, logging: {} } }
    );

    // Register tools — default to project tools if none provided
    if (registerFns.length === 0) {
        const { registerProjectTools } = await import("@/tools/project.tools");
        registerProjectTools(server, state);
    } else {
        for (const fn of registerFns) {
            fn(server, state);
        }
    }

    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    const client = new Client({ name: "test-client", version: "0.0.0" });

    await server.connect(serverTransport);
    await client.connect(clientTransport);

    return {
        server,
        client,
        state,
        cleanup: async () => {
            await client.close();
            await server.close();
        }
    };
}

// ─── Recording Test Context ───────────────────────────────────────────────────

/**
 * Creates an MCP test context that records all JSON-RPC messages in both directions.
 * Wraps InMemoryTransport.send and onmessage post-connection to intercept traffic.
 */
export async function createRecordingMcpTestContext(
    ...registerFns: ToolRegistrationFn[]
): Promise<RecordingMcpTestContext> {
    const records: ProtocolRecord[] = [];
    const state: SessionState = { projectDir: undefined };

    const server = new McpServer(
        { name: "test-server", version: "0.0.0" },
        { capabilities: { tools: {}, logging: {} } }
    );

    if (registerFns.length === 0) {
        const { registerProjectTools } = await import("@/tools/project.tools");
        registerProjectTools(server, state);
    } else {
        for (const fn of registerFns) {
            fn(server, state);
        }
    }

    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const client = new Client({ name: "test-client", version: "0.0.0" });

    await server.connect(serverTransport);
    await client.connect(clientTransport);

    // Intercept outgoing client messages (client → server)
    const originalClientSend = clientTransport.send.bind(clientTransport);
    clientTransport.send = async (message: unknown, options?: unknown) => {
        records.push({ timestamp: Date.now(), direction: "client-to-server", message });
        return (originalClientSend as (m: unknown, o?: unknown) => Promise<void>)(message, options);
    };

    // Intercept incoming client messages (server → client)
    const originalOnMessage = clientTransport.onmessage;
    clientTransport.onmessage = (message: unknown, extra?: unknown) => {
        records.push({ timestamp: Date.now(), direction: "server-to-client", message });
        (originalOnMessage as ((m: unknown, e?: unknown) => void) | undefined)?.(message, extra);
    };

    const getToolCalls = (): ToolCallRecord[] =>
        records
            .filter(r => {
                const msg = r.message as Record<string, unknown>;
                return r.direction === "client-to-server" && msg.method === "tools/call";
            })
            .map(r => {
                const msg = r.message as Record<string, unknown>;
                const params = msg.params as Record<string, unknown>;
                return {
                    name: params.name as string,
                    arguments: params.arguments,
                    timestamp: r.timestamp
                };
            });

    const getToolCallSequence = (): string[] => getToolCalls().map(c => c.name);

    const assertToolOrder = (expectedNames: string[]): void => {
        const actual = getToolCallSequence();
        if (actual.length < expectedNames.length) {
            throw new Error(
                `Expected tool call sequence ${JSON.stringify(expectedNames)} but only got ${JSON.stringify(actual)}`
            );
        }
        for (let i = 0; i < expectedNames.length; i++) {
            if (actual[i] !== expectedNames[i]) {
                throw new Error(
                    `Tool call at index ${i}: expected "${expectedNames[i]}" but got "${actual[i]}"\n` +
                        `Full sequence: ${JSON.stringify(actual)}`
                );
            }
        }
    };

    return {
        server,
        client,
        state,
        records,
        getToolCalls,
        getToolCallSequence,
        assertToolOrder,
        cleanup: async () => {
            await client.close();
            await server.close();
        }
    };
}
