import { createMcpServer } from "./server";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

/**
 * Starts the MCP server with STDIO transport.
 * Communicates via stdin/stdout for CLI-based MCP clients.
 */
export async function startStdioServer(): Promise<void> {
    const server = createMcpServer();
    const transport = new StdioServerTransport();

    // Log to stderr since stdout is used for MCP communication
    console.error("[STDIO] Starting MCP server...");

    await server.connect(transport);

    console.error("[STDIO] MCP server connected and ready");

    setupGracefulShutdown(transport);
}

function setupGracefulShutdown(transport: StdioServerTransport): void {
    const shutdown = async (): Promise<void> => {
        console.error("\n[STDIO] Shutting down server...");
        await transport.close();
        process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
}
