import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import cors from "cors";
import { MENDIX_PROJECT_DIR, PORT, validateProjectDir } from "@/config";
import { setupRoutes } from "./routes";
import { sessionManager } from "./session";

async function logProjectConfig(): Promise<void> {
    if (MENDIX_PROJECT_DIR) {
        const validation = await validateProjectDir(MENDIX_PROJECT_DIR);
        if (validation.valid) {
            console.log(`[HTTP] Project: ${validation.projectName} (${MENDIX_PROJECT_DIR})`);
        } else {
            console.warn(`[HTTP] Warning: MENDIX_PROJECT_DIR is set but invalid: ${validation.error}`);
        }
    } else {
        console.log(`[HTTP] No project configured (set MENDIX_PROJECT_DIR to enable deploy support)`);
    }
}

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
        logProjectConfig();
    });

    const shutdown = async (): Promise<void> => {
        console.log("\n[HTTP] Shutting down server...");
        await sessionManager.closeAll();
        server.close(() => process.exit(0));
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
}
