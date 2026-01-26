import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import type { Express, Request, Response } from "express";
import { SERVER_NAME, SERVER_VERSION } from "@/config";
import { createMcpServer } from "./server";
import { sessionManager } from "./session";

/**
 * Sets up all routes for the Express application.
 */
export function setupRoutes(app: Express): void {
    setupHealthRoute(app);
    setupMcpRoute(app);
}

/**
 * Health check endpoint for monitoring.
 */
function setupHealthRoute(app: Express): void {
    app.get("/health", (_req: Request, res: Response) => {
        res.json({
            status: "ok",
            server: SERVER_NAME,
            version: SERVER_VERSION,
            sessions: sessionManager.sessionCount
        });
    });
}

/**
 * Main MCP endpoint handling session management and request routing.
 */
function setupMcpRoute(app: Express): void {
    // Handle CORS preflight explicitly
    app.options("/mcp", (_req: Request, res: Response) => {
        res.status(204).end();
    });

    app.all("/mcp", async (req: Request, res: Response) => {
        const sessionId = req.headers["mcp-session-id"] as string | undefined;

        try {
            // Case 1: Existing session - reuse transport
            if (sessionId && sessionManager.hasSession(sessionId)) {
                const transport = sessionManager.getTransport(sessionId)!;
                await transport.handleRequest(req, res, req.body);
                return;
            }

            // Case 2: New session via POST with initialize request
            if (req.method === "POST" && !sessionId && isInitializeRequest(req.body)) {
                const transport = sessionManager.createTransport();
                const server = createMcpServer();
                await server.connect(transport);
                await transport.handleRequest(req, res, req.body);
                return;
            }

            // Case 3: GET request for SSE - create new session
            // StreamableHTTP uses GET for server-to-client event streams
            if (req.method === "GET") {
                const transport = sessionManager.createTransport();
                const server = createMcpServer();
                await server.connect(transport);
                await transport.handleRequest(req, res);
                return;
            }

            // Case 4: Invalid request
            sendJsonRpcError(res, 400, "Bad Request: No valid session ID provided");
        } catch (error) {
            console.error("[MCP] Route error:", error);
            sendJsonRpcError(
                res,
                400,
                "Invalid session. Send an initialize request without session ID to start a new session."
            );
        }
    });
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
