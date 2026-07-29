#!/usr/bin/env node
import { SERVER_NAME, SERVER_VERSION } from "@/config";
import { startHttpServer } from "@/server/http";
import { startStdioServer } from "@/server/stdio";

const TRANSPORTS = ["stdio", "http"] as const;
type TransportMode = (typeof TRANSPORTS)[number];

const USAGE = `${SERVER_NAME} ${SERVER_VERSION}

Usage: pluggable-widgets-mcp [transport]

Transports:
  stdio   JSON-RPC over stdin/stdout (default) — used when a host such as
          Mendix Studio Pro spawns this server as a child process.
  http    Local HTTP on 127.0.0.1, for pointing the MCP Inspector at a running
          server. Stateless; sessions are not supported.

Environment:
  MENDIX_PROJECT_DIR        Path to the open Mendix project. Also the sandbox root.
  MCP_EXTRA_ALLOWED_PATHS   Extra permitted roots, platform-delimited (dev only).
  MCP_LOG_LEVEL             debug | info | warn | error (default: info).
  PORT                      HTTP port (default: 3100).`;

function parseTransport(argument: string | undefined): TransportMode {
    if (argument === undefined) {
        return "stdio";
    }
    if ((TRANSPORTS as readonly string[]).includes(argument)) {
        return argument as TransportMode;
    }
    // An unrecognised argument used to fall through to stdio via an unchecked cast, so a typo like
    // `htpp` started a server that looked fine and spoke the wrong protocol.
    console.error(`Unknown transport "${argument}".\n\n${USAGE}`);
    process.exit(1);
}

function main(): void {
    const argument = process.argv[2];

    if (argument === "--help" || argument === "-h") {
        console.error(USAGE);
        return;
    }

    const transport = parseTransport(argument);

    if (transport === "http") {
        startHttpServer();
        return;
    }

    startStdioServer().catch((error: unknown) => {
        console.error(`Fatal error starting stdio server: ${String(error)}`);
        process.exit(1);
    });
}

main();
