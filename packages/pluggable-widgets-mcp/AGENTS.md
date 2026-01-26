# Pluggable Widgets MCP Server

MCP server enabling AI assistants to scaffold and manage Mendix pluggable widgets via STDIO (default) or HTTP transport.

## Quick Reference

```bash
pnpm dev          # Development with hot reload
pnpm build        # TypeScript compilation + path alias resolution
pnpm start        # Build and run (STDIO mode, default)
pnpm start:http   # Build and run (HTTP mode, port 3100)
pnpm lint         # ESLint check
```

## Project Structure

```
src/
├── index.ts          # Entry point - transport mode selection
├── config.ts         # Server configuration and constants
├── security/         # Path traversal & extension validation
├── server/           # HTTP and STDIO transport setup
├── resources/        # MCP resources (guidelines)
├── generators/       # XML and TSX code generators
└── tools/            # MCP tool implementations
```

## Adding Tools

1. Create `src/tools/my-feature.tools.ts`:

```typescript
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerMyTools(server: McpServer): void {
    server.tool(
        "my-tool",
        "Description shown to LLM",
        z.object({ param: z.string().describe("Parameter description") }),
        async ({ param }) => ({
            content: [{ type: "text", text: "Success" }]
        })
    );
}
```

2. Register in `src/tools/index.ts`:

```typescript
import { registerMyTools } from "./my-feature.tools";

export function registerAllTools(server: McpServer): void {
    // ... existing registrations
    registerMyTools(server);
}
```

## Code Patterns

- **Imports**: Use `@/` path alias for absolute imports from `src/`
- **Schemas**: All tool inputs require Zod schemas
- **Errors**: Use `createErrorResponse()` from `@/tools/utils/response`
- **Long operations**: Use `ProgressTracker` from `@/tools/utils/progress-tracker`

## Notification Behavior (Important for AI Agents)

When using this MCP server, understand where different types of output appear:

| Output Type                | Visibility                 | Purpose                                                 |
| -------------------------- | -------------------------- | ------------------------------------------------------- |
| **Tool Results**           | ✅ Visible in conversation | Final outcomes, structured data, success/error messages |
| **Progress Notifications** | ❌ Not in conversation     | Client UI indicators only (spinners, progress bars)     |
| **Log Messages**           | ❌ Not in conversation     | Debug console/MCP Inspector only                        |

**Key Implications for AI Agents:**

1. **Don't expect intermediate progress in chat**: Long operations (scaffolding, building) will show results only when complete. The conversation won't contain step-by-step progress updates.

2. **Tool results are authoritative**: Only tool result content appears in the conversation history. Use this for:

    - Success confirmations with file paths
    - Structured error messages with suggestions
    - Any information the AI needs to continue the workflow

3. **Progress tracking is for humans**: `sendProgress()` and `sendLogMessage()` are for human observers using MCP Inspector or UI indicators, not for AI decision-making.

4. **When debugging**:
    - If operations seem to "hang", check MCP Inspector's Notifications/Logs panels
    - Progress notifications confirm the server is working, even if the chat is quiet
    - This is per MCP specification, not a bug

**Example Workflow:**

```typescript
// ❌ This progress won't appear in AI's context
await sendProgress(context, 50, "Scaffolding widget...");

// ✅ This result WILL appear in AI's context
return createToolResponse(`Widget created at ${widgetPath}`);
```

## Testing

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

## Security

**Read before implementing file operations**: [docs/agent/security.md](docs/agent/security.md)

All file operation tools must use `validateFilePath()` from `@/security` to prevent path traversal attacks.
