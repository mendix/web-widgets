import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import cors from "cors";
import { PORT } from "@/config";
import { setupRoutes } from "./routes";
import { sessionManager } from "./session";

/**
 * Starts the MCP server with HTTP/Streamable transport.
 * Supports multiple concurrent sessions via Express.
 */
export async function startHttpServer(): Promise<void> {
    const app = createMcpExpressApp();
    app.use(cors());

    setupRoutes(app);

    app.listen(PORT, () => {
        console.log(`[HTTP] MCP Server started on port ${PORT}`);
        console.log(`[HTTP] Health check: http://localhost:${PORT}/health`);
        console.log(`[HTTP] MCP endpoint: http://localhost:${PORT}/mcp`);
    });

    setupGracefulShutdown();
}

function setupGracefulShutdown(): void {
    const shutdown = async (): Promise<void> => {
        console.log("\n[HTTP] Shutting down server...");
        await sessionManager.closeAll();
        process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
}
