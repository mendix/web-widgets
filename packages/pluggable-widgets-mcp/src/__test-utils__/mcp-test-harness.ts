import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { SessionState } from "@/tools/session-state";

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
