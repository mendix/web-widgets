import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { Express, Request, Response } from "express";
import { getConfiguredProjectDir, SERVER_NAME, SERVER_VERSION } from "@/config";
import { createLogger } from "@/tools/utils/logger";
import { createMcpServer } from "./server";

const log = createLogger("http");

/**
 * Sets up all routes for the Express application.
 */
export function setupRoutes(app: Express): void {
    setupHealthRoute(app);
    setupMcpRoute(app);
}

/**
 * Health check endpoint for monitoring.
 *
 * Deliberately does not report the project path: this endpoint is unauthenticated, and the absolute
 * path of the user's project is not something to hand out.
 */
function setupHealthRoute(app: Express): void {
    app.get("/health", (_req: Request, res: Response) => {
        res.json({
            status: "ok",
            server: SERVER_NAME,
            version: SERVER_VERSION,
            projectConfigured: getConfiguredProjectDir() !== undefined
        });
    });
}

/**
 * The MCP endpoint, served statelessly.
 *
 * Each POST builds a transport and server, handles the one request, and disposes of both.
 * Statelessness is what makes this transport simple enough to trust: the previous session-keeping
 * version leaked an `McpServer` on every GET, could never terminate a session (DELETE carries no
 * body, so the handler threw before reaching the transport), and therefore grew its session map
 * without bound.
 *
 * STDIO is the transport Studio Pro uses. HTTP exists so the MCP Inspector can be pointed at a
 * running server, which needs no cross-request state.
 */
function setupMcpRoute(app: Express): void {
    app.post("/mcp", async (req: Request, res: Response) => {
        const body = req.body as Record<string, unknown>;
        log.debug(`${String(body?.method ?? "request")}`);

        // `sessionIdGenerator: undefined` selects the SDK's stateless mode.
        const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
        const server = createMcpServer();

        // Disposal is tied to the response rather than to the await below, so a streamed response
        // is not torn down while it is still being written.
        res.on("close", () => {
            transport.close().catch(error => log.warn(`Transport close failed: ${String(error)}`));
            server.close().catch(error => log.warn(`Server close failed: ${String(error)}`));
        });

        try {
            await server.connect(transport);
            await transport.handleRequest(req, res, body);
        } catch (error) {
            log.error(`Request failed: ${String(error)}`);
            if (!res.headersSent) {
                sendJsonRpcError(res, 500, "Internal server error");
            }
        }
    });

    app.options("/mcp", (_req: Request, res: Response) => {
        res.status(204).end();
    });

    // GET (resumable event stream) and DELETE (session termination) are meaningful only for a
    // stateful server. Answering 405 states that plainly instead of failing as a bad request.
    for (const method of ["get", "delete"] as const) {
        app[method]("/mcp", (_req: Request, res: Response) => {
            sendJsonRpcError(res, 405, "This server is stateless: use POST /mcp. Sessions are not supported.");
        });
    }
}

/**
 * Sends a JSON-RPC error response.
 */
function sendJsonRpcError(res: Response, statusCode: number, message: string): void {
    res.status(statusCode).json({
        jsonrpc: "2.0",
        error: {
            code: -32000,
            message
        },
        id: null
    });
}
