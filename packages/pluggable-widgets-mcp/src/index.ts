import { startHttpServer } from "@/server/http";
import { startStdioServer } from "@/server/stdio";

type TransportMode = "http" | "stdio";

const mode = (process.argv[2] as TransportMode) || "http";

async function main(): Promise<void> {
    switch (mode) {
        case "stdio":
            await startStdioServer();
            break;
        case "http":
        default:
            await startHttpServer();
            break;
    }
}

main().catch(err => {
    console.error("Fatal error:", err);
    process.exit(1);
});
