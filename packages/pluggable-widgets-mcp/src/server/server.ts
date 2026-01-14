import { SERVER_ICON, SERVER_INSTRUCTIONS, SERVER_NAME, SERVER_VERSION, SERVER_WEBSITE_URL } from "@/config";
import { registerResources } from "@/resources";
import { registerAllTools } from "@/tools";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Creates and configures a new MCP server instance with all registered tools and resources.
 */
export function createMcpServer(): McpServer {
    const server = new McpServer(
        {
            name: SERVER_NAME,
            version: SERVER_VERSION,
            icons: [SERVER_ICON],
            websiteUrl: SERVER_WEBSITE_URL
        },
        {
            capabilities: {
                logging: {},
                prompts: {},
                resources: {},
                tools: {}
            },
            instructions: SERVER_INSTRUCTIONS
        }
    );

    registerAllTools(server);
    registerResources(server);

    return server;
}
