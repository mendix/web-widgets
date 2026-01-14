#!/usr/bin/env node
import { startHttpServer } from "@/server/http";
import { startStdioServer } from "@/server/stdio";

type TransportMode = "http" | "stdio";

const mode = (process.argv[2] as TransportMode) || "stdio";

if (mode === "http") {
    startHttpServer();
} else {
    startStdioServer().catch(err => {
        console.error("Fatal error:", err);
        process.exit(1);
    });
}
