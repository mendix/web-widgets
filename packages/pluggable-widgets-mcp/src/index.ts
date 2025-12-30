import { startHttpServer } from "@/server/http";
import { startStdioServer } from "@/server/stdio";

type TransportMode = "http" | "stdio";

const mode = (process.argv[2] as TransportMode) || "http";

switch (mode) {
    case "stdio":
        startStdioServer().catch(err => {
            console.error("Fatal error:", err);
            process.exit(1);
        });
        break;
    case "http":
    default:
        startHttpServer();
        break;
}
