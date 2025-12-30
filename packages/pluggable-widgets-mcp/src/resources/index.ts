import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { GUIDELINE_RESOURCES, loadGuidelineContent } from "./guidelines";

/**
 * Registers all MCP resources with the server.
 *
 * Resources are read-only data sources that clients can fetch on-demand.
 * We expose the Mendix widget development guidelines as resources so LLMs
 * can access them when implementing widget functionality.
 */
export function registerResources(server: McpServer): void {
    registerGuidelineResources(server);
}

/**
 * Registers guideline documentation as MCP resources.
 */
function registerGuidelineResources(server: McpServer): void {
    for (const resource of GUIDELINE_RESOURCES) {
        server.registerResource(
            resource.name,
            resource.uri,
            {
                title: resource.title,
                description: resource.description,
                mimeType: "text/markdown"
            },
            async uri => {
                const content = await loadGuidelineContent(resource.filename);
                return {
                    contents: [
                        {
                            uri: uri.href,
                            mimeType: "text/markdown",
                            text: content
                        }
                    ]
                };
            }
        );
    }

    console.error(`[resources] Registered ${GUIDELINE_RESOURCES.length} guideline resources`);
}
