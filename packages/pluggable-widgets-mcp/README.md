# Mendix Pluggable Widgets MCP Server

> **Work in Progress** - This is an MVP focused on widget scaffolding. Widget editing capabilities coming soon.

A Model Context Protocol (MCP) server that enables AI assistants to scaffold Mendix pluggable widgets programmatically.

## Quick Start

```bash
pnpm install
pnpm build          # Build the server
pnpm start          # STDIO mode (default)
pnpm start:stdio    # HTTP mode
```

## Global Installation

For use with MCP clients (Cursor, Claude Desktop, LMStudio), install globally:

```bash
# Build first
pnpm build

# Link globally using npm (NOT pnpm - better MCP client compatibility)
npm link

# Verify installation
which pluggable-widgets-mcp
```

## Transport Modes

### STDIO Mode (default)

Runs via stdin/stdout for CLI-based MCP clients (Claude Desktop, etc.).

```bash
pnpm start
pnpm start:stdio
```

### HTTP Mode

Runs an HTTP server for web-based MCP clients.

```bash
pnpm start:http
```

- Server runs on `http://localhost:3100` (override with `PORT` env var)
- Health check: `GET /health`
- MCP endpoint: `POST /mcp`

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

**Option 1: Global command (after `npm link`)**

```json
{
    "mcpServers": {
        "pluggable-widgets-mcp": {
            "command": "pluggable-widgets-mcp",
            "args": ["stdio"]
        }
    }
}
```

**Option 2: Absolute path (more reliable during development)**

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

> **Note:** After rebuilding the server, you may need to restart/reconnect your MCP client to pick up changes.

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

### File Operation Tools

| Tool                       | Description                                                  |
| -------------------------- | ------------------------------------------------------------ |
| `list-widget-files`        | Lists all files in a widget directory, grouped by type       |
| `read-widget-file`         | Reads the contents of a file from a widget directory         |
| `write-widget-file`        | Writes content to a file (creates parent dirs automatically) |
| `batch-write-widget-files` | Writes multiple files atomically                             |

**Security:** All file operations are protected by `src/security/guardrails.ts`:

- Path traversal is blocked (no `..` escapes)
- Extension whitelist: `.tsx`, `.ts`, `.xml`, `.scss`, `.css`, `.json`, `.md`

### build-widget

Builds a widget using `pluggable-widgets-tools`, producing an `.mpk` file.

| Parameter    | Required | Description                           |
| ------------ | -------- | ------------------------------------- |
| `widgetPath` | Yes      | Absolute path to the widget directory |

Returns structured errors for TypeScript, XML, or dependency issues.

## Available Resources

| URI                                   | Description                                                                |
| ------------------------------------- | -------------------------------------------------------------------------- |
| `mendix://guidelines/property-types`  | Complete reference for all Mendix widget property types                    |
| `mendix://guidelines/widget-patterns` | Reusable patterns for common widget types (Button, Input, Container, etc.) |

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

## Understanding Feedback and Notifications

This server uses MCP's notification system to provide progress updates and logging. However, **different types of feedback appear in different places**—not all feedback shows up in your chat conversation.

### Where Different Types of Feedback Appear

| Feedback Type              | Where It Appears                       | Example                                                           |
| -------------------------- | -------------------------------------- | ----------------------------------------------------------------- |
| **Tool Results**           | ✅ Chat conversation                   | Widget created at `/path/to/widget`, Build completed successfully |
| **Progress Notifications** | ⚙️ Client UI (spinners, progress bars) | "Scaffolding widget...", "Building widget..."                     |
| **Log Messages**           | 🔍 Debug console (MCP Inspector)       | Detailed operation logs, debug info                               |

### Why Progress Doesn't Show in Chat

**This is by design per the MCP specification**, not a bug. The MCP architecture separates concerns:

- **`notifications/progress`** → Routed to client UI indicators (loading spinners, status bars)
- **`notifications/message`** → Routed to debug/inspector consoles for developers
- **Tool results** → Returned to the conversation when operations complete

This means:

- Long operations (scaffolding, building) will show **results** when complete
- You won't see intermediate progress steps in the chat history
- MCP Inspector shows all notifications in real-time (bottom-right panel)

### Viewing Debug Output

**With MCP Inspector:**

1. Run: `npx @modelcontextprotocol/inspector node dist/index.js stdio`
2. Execute a tool (e.g., `create-widget`)
3. Watch the **Notifications panel** (bottom-right) for progress updates
4. Check the **Logs panel** for detailed debug output

**With Claude Desktop:**

- Progress notifications may appear as UI indicators (client-dependent)
- Check Claude Desktop's developer console for log messages (if available)
- Tool results will always appear in the conversation

### Expected Behavior Examples

**During widget scaffolding:**

- Chat shows: "Starting scaffolding..." → (wait) → "Widget created at `/path`"
- Inspector shows: Step-by-step progress notifications for all 14 prompts

**During widget building:**

- Chat shows: "Building..." → (wait) → "Build successful" or structured error
- Inspector shows: TypeScript compilation progress, dependency resolution

## Roadmap

- [x] Widget scaffolding (`create-widget`)
- [x] HTTP transport
- [x] STDIO transport
- [x] Progress notifications
- [x] File operations (list, read, write, batch-write)
- [x] Build tool (`build-widget`)
- [x] Guideline resources (property-types, widget-patterns)
- [ ] Widget property editing (XML manipulation)
- [ ] TypeScript error recovery suggestions

## License

Apache-2.0 - Mendix Technology BV 2025
