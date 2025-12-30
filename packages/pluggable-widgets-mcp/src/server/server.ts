import { SERVER_ICON, SERVER_INSTRUCTIONS, SERVER_NAME, SERVER_VERSION, SERVER_WEBSITE_URL } from "@/config";
import { registerResources } from "@/resources";
import { getAllTools } from "@/tools";
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

    registerTools(server);
    registerResources(server);

    return server;
}

/**
 * Registers all available tools with the MCP server.
 */
function registerTools(server: McpServer): void {
    const tools = getAllTools();

    for (const tool of tools) {
        server.registerTool(
            tool.name,
            {
                title: tool.title,
                description: tool.description,
                inputSchema: tool.inputSchema
            },
            tool.handler
        );
    }
}
