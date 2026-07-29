import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createLogger } from "@/tools/utils/logger";
import { logProjectConfig } from "./log-project-config";
import { createMcpServer } from "./server";

const log = createLogger("stdio");

/**
 * Starts the MCP server over STDIO — the transport Studio Pro spawns.
 *
 * stdout carries the JSON-RPC stream, so nothing here may write to it. All logging goes to stderr,
 * which the parent process captures.
 */
export async function startStdioServer(): Promise<void> {
    const server = createMcpServer();
    const transport = new StdioServerTransport();

    log.info("Starting");
    await logProjectConfig(log.info, log.warn);

    await server.connect(transport);

    log.info("Connected and ready");

    setupGracefulShutdown(transport);
}

function setupGracefulShutdown(transport: StdioServerTransport): void {
    let closing = false;

    const shutdown = async (reason: string): Promise<void> => {
        if (closing) {
            return;
        }
        closing = true;
        log.info(`Shutting down (${reason})`);
        await transport.close();
        process.exit(0);
    };

    const on = (event: string, reason: string, target: NodeJS.EventEmitter): void => {
        target.on(event, () => {
            shutdown(reason).catch(error => {
                log.error(`Shutdown failed: ${String(error)}`);
                process.exit(1);
            });
        });
    };

    on("SIGINT", "SIGINT", process);
    on("SIGTERM", "SIGTERM", process);

    // The parent closing our stdin is how a stdio child learns the host is gone. Without this the
    // process outlives Studio Pro — signals alone are not enough, and on Windows SIGTERM/SIGINT are
    // not delivered the way POSIX code expects.
    on("end", "stdin closed", process.stdin);
    on("close", "stdin closed", process.stdin);
}
