# Mendix Pluggable Widgets MCP Server

> **Work in Progress** - This is an MVP focused on widget scaffolding. Widget editing capabilities coming soon.

A Model Context Protocol (MCP) server that enables AI assistants to scaffold Mendix pluggable widgets programmatically.

## Quick Start

```bash
pnpm install
pnpm start          # HTTP mode (default)
pnpm start:stdio    # STDIO mode
```

## Transport Modes

### HTTP Mode (default)

Runs an HTTP server for web-based MCP clients.

```bash
pnpm start
pnpm start:http
```

- Server runs on `http://localhost:3100` (override with `PORT` env var)
- Health check: `GET /health`
- MCP endpoint: `POST /mcp`

### STDIO Mode

Runs via stdin/stdout for CLI-based MCP clients (Claude Desktop, etc.).

```bash
pnpm start:stdio
```

## MCP Client Configuration

### HTTP

```json
{
    "mcpServers": {
        "pluggable-widgets-mcp": {
            "url": "http://localhost:3100/mcp"
        }
    }
}
```

### STDIO

**_Some client setups like Claude Desktop support STDIO only (for now)_**

```json
{
    "mcpServers": {
        "pluggable-widgets-mcp": {
            "command": "node",
            "args": ["/path/to/pluggable-widgets-mcp/dist/index.js", "stdio"]
        }
    }
}
```

## Available Tools

### create-widget

Scaffolds a new Mendix pluggable widget using `@mendix/generator-widget`.

| Parameter             | Required | Default      | Description                          |
| --------------------- | -------- | ------------ | ------------------------------------ |
| `name`                | Yes      | -            | Widget name (PascalCase recommended) |
| `description`         | Yes      | -            | Brief description of the widget      |
| `version`             | No       | `1.0.0`      | Initial version (semver)             |
| `author`              | No       | `Mendix`     | Author name                          |
| `license`             | No       | `Apache-2.0` | License type                         |
| `organization`        | No       | `Mendix`     | Organization namespace               |
| `template`            | No       | `empty`      | `full` (sample code) or `empty`      |
| `programmingLanguage` | No       | `typescript` | `typescript` or `javascript`         |
| `unitTests`           | No       | `true`       | Include unit test setup (Jest/TS)    |
| `e2eTests`            | No       | `false`      | Include E2E test setup (Playwright)  |

Generated widgets are placed in `generations/` directory within this package.

## Development

```bash
pnpm dev          # Development mode with hot reload
pnpm build        # Build for production
pnpm start        # Build and run
```

## Testing with MCP Inspector

The [MCP Inspector](https://github.com/modelcontextprotocol/inspector) is an interactive debugging tool for testing MCP servers. It provides a web UI to connect to your server, explore available tools, and execute them with custom inputs.

### Quick Start

```bash
# Run Inspector against this server (STDIO mode)
npx @modelcontextprotocol/inspector node dist/index.js stdio

# Or for HTTP mode, start the server first then connect via Inspector
pnpm start
npx @modelcontextprotocol/inspector
# Then enter http://localhost:3100/mcp as the server URL
```

### Using the Inspector

1. **Connect** - The Inspector will automatically connect to your MCP server
2. **Explore Tools** - View all registered tools (`create-widget`, etc.) with their schemas
3. **Execute Tools** - Fill in parameters and run tools to test behavior
4. **View Responses** - See JSON responses, progress notifications, and logs in real-time

### Example: Testing `create-widget`

1. Start the Inspector: `npx @modelcontextprotocol/inspector node dist/index.js stdio`
2. Select the `create-widget` tool from the tools list
3. Fill in required parameters:
    ```json
    {
        "name": "TestWidget",
        "description": "A test widget",
        ... // Defaults for other optional values if not entered
    }
    ```
4. Click "Execute" and watch progress notifications as the widget is scaffolded
5. Check `generations/testwidget/` for the created widget

This is useful for verifying tool behavior without needing a full AI client integration.

## Roadmap

- [x] Widget scaffolding
- [x] HTTP transport
- [x] STDIO transport
- [x] Progress notifications
- [ ] Widget editing and modification
- [ ] Property management
- [ ] Build and deployment tools

## License

Apache-2.0 - Mendix Technology BV 2025
