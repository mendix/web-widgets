import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import cors from "cors";
import { PORT } from "@/config";
import { setupRoutes } from "./routes";
import { sessionManager } from "./session";

/**
 * Starts the MCP server with HTTP/Streamable transport.
 * Supports multiple concurrent sessions via Express.
 */
export function startHttpServer(): void {
    const app = createMcpExpressApp();
    app.use(
        cors({
            origin: true,
            methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
            allowedHeaders: "*",
            exposedHeaders: ["mcp-session-id"],
            credentials: true
        })
    );

    setupRoutes(app);

    const server = app.listen(PORT, () => {
        console.log(`[HTTP] MCP Server started on port ${PORT}`);
        console.log(`[HTTP] Health check: http://localhost:${PORT}/health`);
        console.log(`[HTTP] MCP endpoint: http://localhost:${PORT}/mcp`);
    });

    const shutdown = async (): Promise<void> => {
        console.log("\n[HTTP] Shutting down server...");
        await sessionManager.closeAll();
        server.close(() => process.exit(0));
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
}
