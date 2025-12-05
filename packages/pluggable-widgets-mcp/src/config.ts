import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Server configuration
export const SERVER_NAME = "pluggable-widgets-mcp";
export const SERVER_VERSION = "0.1.0";
export const PORT = parseInt(process.env.PORT || "3100", 10);

// Server metadata
export const SERVER_ICON = {
    src: "https://avatars.githubusercontent.com/u/133443?s=200&v=4",
    sizes: ["128x128"],
    mimeType: "image/png"
};
export const SERVER_WEBSITE_URL = "https://github.com/mendix/web-widgets";
export const SERVER_INSTRUCTIONS =
    "This is a MCP server for Mendix Pluggable Widgets. It allows you to create and edit widgets.";

// Paths - use fileURLToPath for Node.js 18 compatibility (import.meta.dirname requires Node 20.11+)
const __dirname = import.meta.dirname ?? dirname(fileURLToPath(import.meta.url));
export const PACKAGE_ROOT = join(__dirname, "../");
export const GENERATIONS_DIR = join(PACKAGE_ROOT, "generations");

// Timeouts
export const SCAFFOLD_TIMEOUT_MS = 300000; // 5 minutes
