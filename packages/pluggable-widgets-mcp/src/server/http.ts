import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import type { Server } from "node:http";
import { PORT } from "@/config";
import { createLogger } from "@/tools/utils/logger";
import { logProjectConfig } from "./log-project-config";
import { setupRoutes } from "./routes";

const log = createLogger("http");

/** Loopback only. The tools spawn `npm run build`, so this must not be reachable off-box. */
const HOST = "127.0.0.1";

/**
 * Starts the MCP server over HTTP.
 *
 * This transport exists for local debugging — pointing the MCP Inspector at a running server.
 * Studio Pro uses STDIO. Requests are handled statelessly; see `routes.ts`.
 */
export function startHttpServer(): void {
    // createMcpExpressApp installs DNS-rebinding protection when the host is loopback.
    const app = createMcpExpressApp({ host: HOST });

    setupRoutes(app);

    const server = app.listen(PORT, HOST, () => {
        log.info(`Listening on http://${HOST}:${PORT}`);
        log.info(`Health: http://${HOST}:${PORT}/health · MCP: http://${HOST}:${PORT}/mcp`);
        logProjectConfig(log.info, log.warn).catch(error =>
            log.warn(`Could not read project config: ${String(error)}`)
        );
    });

    server.on("error", (error: NodeJS.ErrnoException) => {
        if (error.code === "EADDRINUSE") {
            log.error(`Port ${PORT} is already in use. Set PORT to a free port, or stop the other server.`);
        } else {
            log.error(`Server error: ${error.message}`);
        }
        process.exit(1);
    });

    setupGracefulShutdown(server);
}

function setupGracefulShutdown(server: Server): void {
    const shutdown = (): void => {
        log.info("Shutting down");
        server.close(() => process.exit(0));
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
}
