import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { join, dirname, resolve } from "path";
import { fileURLToPath } from "url";

import { scanPackages } from "./helpers.js";
import { getSampleForUri } from "./sampling.js";
import { prompts } from "./prompts.js";
import { Guardrails } from "./guardrails.js";
import { DiffEngine } from "./diff-engine.js";
import { PropertyEngine } from "./property-engine.js";
import { getAllTools } from "./tools/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Determine REPO_ROOT:
// 1. Use REPO_ROOT environment variable if set (Docker, production)
// 2. Use CWD if provided (useful when running from monorepo root)
// 3. Fall back to resolving from __dirname (local development from MCP server directory)
const REPO_ROOT = process.env.REPO_ROOT ? resolve(process.env.REPO_ROOT) : resolve(__dirname, "../../");

// Debug logging for REPO_ROOT
console.error(`[MCP Init] __dirname: ${__dirname}`);
console.error(`[MCP Init] process.cwd(): ${process.cwd()}`);
console.error(`[MCP Init] REPO_ROOT env: ${process.env.REPO_ROOT || "not set"}`);
console.error(`[MCP Init] Resolved REPO_ROOT: ${REPO_ROOT}`);

// Initialize guardrails, diff engine, and property engine
const guardrails = new Guardrails(REPO_ROOT);
const diffEngine = new DiffEngine(REPO_ROOT, guardrails);
const propertyEngine = new PropertyEngine();

async function main(): Promise<void> {
    const server = new McpServer({
        name: "mendix-pluggable-mcp",
        version: "0.1.0",
        title: "Mendix Widgets MCP"
    });

    // Register all tools dynamically from modular tool definitions
    const tools = getAllTools({ repoRoot: REPO_ROOT, guardrails, diffEngine, propertyEngine });
    for (const tool of tools) {
        server.registerTool(
            tool.name,
            { title: tool.title, description: tool.description, inputSchema: tool.inputSchema },
            tool.handler
        );
    }

    // Register widget samples as resources for context
    // This provides a standard way for AI assistants to access widget context
    const packagesDir = join(REPO_ROOT, "packages");

    // Register a resource for the repository overview
    server.registerResource(
        "repository-list",
        "mendix-widget://repository/list",
        {
            title: "Widget Repository Overview",
            description: "Complete list of widgets in the repository with metadata",
            mimeType: "application/json"
        },
        async uri => {
            const packages = await scanPackages(packagesDir);
            return {
                contents: [
                    {
                        uri: uri.href,
                        text: JSON.stringify(
                            {
                                widget: "repository",
                                type: "overview",
                                timestamp: new Date().toISOString(),
                                content: {
                                    metadata: {
                                        name: "Mendix Web Widgets Repository",
                                        version: "latest",
                                        path: REPO_ROOT,
                                        description: "Complete list of widgets in the repository"
                                    },
                                    widgets: packages
                                }
                            },
                            null,
                            2
                        ),
                        mimeType: "application/json"
                    }
                ]
            };
        }
    );

    // Register dynamic resources for widget contexts
    // We'll register a few key widgets as examples - in production, you might want to register all
    const registerWidgetResources = async () => {
        const packages = await scanPackages(packagesDir);

        // Register resources for the first 10 widgets as examples
        const widgetsToRegister = packages.filter(pkg => pkg.kind === "pluggableWidget").slice(0, 10);

        for (const widget of widgetsToRegister) {
            const widgetName = widget.name.replace("@mendix/", "");

            // Register overview resource
            server.registerResource(
                `${widgetName}-overview`,
                `mendix-widget://${widgetName}/overview`,
                {
                    title: `${widgetName} - Complete Overview`,
                    description: `Full context for ${widgetName} widget including manifest, types, and configuration`,
                    mimeType: "application/json"
                },
                async uri => {
                    const sampleContent = await getSampleForUri(uri.href, REPO_ROOT);
                    if ("error" in sampleContent) {
                        throw new Error(sampleContent.error);
                    }
                    return {
                        contents: [
                            {
                                uri: uri.href,
                                text: JSON.stringify(sampleContent, null, 2),
                                mimeType: "application/json"
                            }
                        ]
                    };
                }
            );

            // Register properties resource
            server.registerResource(
                `${widgetName}-properties`,
                `mendix-widget://${widgetName}/properties`,
                {
                    title: `${widgetName} - Properties`,
                    description: `Property definitions and structure for ${widgetName} widget`,
                    mimeType: "application/json"
                },
                async uri => {
                    const sampleContent = await getSampleForUri(uri.href, REPO_ROOT);
                    if ("error" in sampleContent) {
                        throw new Error(sampleContent.error);
                    }
                    return {
                        contents: [
                            {
                                uri: uri.href,
                                text: JSON.stringify(sampleContent, null, 2),
                                mimeType: "application/json"
                            }
                        ]
                    };
                }
            );
        }
    };

    // Register widget resources on startup
    await registerWidgetResources();

    // Register MCP Prompts for guided workflows (EXPERIMENTAL)
    for (const prompt of prompts) {
        // Build the argsSchema object from prompt arguments
        const argsSchema: Record<string, any> = {};
        for (const arg of prompt.arguments) {
            argsSchema[arg.name] = arg.schema || z.string();
            if (!arg.required) {
                argsSchema[arg.name] = argsSchema[arg.name].optional();
            }
        }

        server.registerPrompt(
            prompt.name,
            {
                title: prompt.title,
                description: prompt.description,
                argsSchema: argsSchema
            },
            prompt.handler
        );
    }

    console.error(`Registered ${prompts.length} prompt templates for guided workflows`);

    await server.connect(new StdioServerTransport());

    // Handle graceful shutdown
    const shutdown = () => {
        console.error("Shutting down MCP server...");
        process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
}

main()
    .then(() => {
        console.error("MCP Server started");
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
