import { MENDIX_PROJECT_DIR, validateProjectDir } from "@/config";
import { createMcpServer } from "./server";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

async function logProjectConfig(): Promise<void> {
    if (MENDIX_PROJECT_DIR) {
        const validation = await validateProjectDir(MENDIX_PROJECT_DIR);
        if (validation.valid) {
            console.error(`[STDIO] Project: ${validation.projectName} (${MENDIX_PROJECT_DIR})`);
        } else {
            console.error(`[STDIO] Warning: MENDIX_PROJECT_DIR is set but invalid: ${validation.error}`);
        }
    } else {
        console.error(`[STDIO] No project configured (set MENDIX_PROJECT_DIR to enable deploy support)`);
    }
}

/**
 * Starts the MCP server with STDIO transport.
 * Communicates via stdin/stdout for CLI-based MCP clients.
 */
export async function startStdioServer(): Promise<void> {
    const server = createMcpServer();
    const transport = new StdioServerTransport();

    // Log to stderr since stdout is used for MCP communication
    console.error("[STDIO] Starting MCP server...");
    await logProjectConfig();

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
