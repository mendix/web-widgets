# Pluggable Widgets MCP Server - AI Agent Guide

This document provides context for AI development assistants working on the MCP (Model Context Protocol) server for Mendix pluggable widgets.

## Overview

This package implements an MCP server that enables AI assistants to scaffold and manage Mendix pluggable widgets programmatically. It supports both HTTP and STDIO transports for flexible integration with various MCP clients.

### Key Characteristics

- **MCP SDK**: Built on `@modelcontextprotocol/sdk` for standardized AI tool integration
- **Dual Transport**: HTTP (Express) for web clients, STDIO for CLI clients (Claude Desktop, etc.)
- **TypeScript**: Fully typed with Zod schemas for runtime validation
- **Widget Generator**: Wraps `@mendix/generator-widget` via PTY for interactive scaffolding

## Project Structure

```
src/
├── index.ts              # Entry point - transport mode selection
├── config.ts             # Server configuration and constants
├── security/
│   ├── guardrails.ts     # Security validation (path traversal, extension whitelist)
│   └── index.ts          # Security module exports
├── server/
│   ├── server.ts         # MCP server factory and tool/resource registration
│   ├── http.ts           # HTTP transport setup (Express)
│   ├── stdio.ts          # STDIO transport setup
│   ├── routes.ts         # Express route handlers
│   └── session.ts        # HTTP session management
├── resources/
│   ├── index.ts          # Resource registration
│   └── guidelines.ts     # Widget development guidelines
└── tools/
    ├── index.ts          # Tool registration aggregation
    ├── types.ts          # MCP tool type definitions
    ├── scaffolding.tools.ts      # Widget creation (create-widget)
    ├── file-operations.tools.ts  # File read/write/list operations
    ├── build.tools.ts            # Widget building and validation
    └── utils/
        ├── generator.ts      # Widget generator PTY wrapper
        ├── progress-tracker.ts # Progress/logging helper
        ├── notifications.ts  # MCP notification utilities
        └── response.ts       # Tool response helpers
```

## Architecture

### Transport Layer

The server supports two transport modes selected via CLI argument:

- **STDIO** (default): Single-session stdin/stdout for CLI integration (Claude Code, Claude Desktop)
- **HTTP**: Multi-session Express server on port 3100 for web clients and testing

### Tool Registration

Tools are registered directly with the MCP server using the SDK's `server.tool()` method. The current architecture uses category-based registration functions:

```typescript
// src/tools/index.ts
export function registerAllTools(server: McpServer): void {
    registerScaffoldingTools(server); // Widget creation
    registerFileOperationTools(server); // File operations
    registerBuildTools(server); // Building & validation
}
```

**Available Tools**:

- **Scaffolding**: `create-widget` - Scaffolds new widgets via PTY interaction
- **File Operations**:
    - `list-widget-files` - Lists files in widget directory
    - `read-widget-file` - Reads widget file contents
    - `write-widget-file` - Writes single file
    - `batch-write-widget-files` - Writes multiple files atomically
- **Build**: `build-widget` - Compiles widget and parses errors (TypeScript, XML, dependencies)

### Resources

MCP resources provide read-only documentation that clients can fetch on-demand:

```typescript
// src/resources/index.ts
export function registerResources(server: McpServer): void {
    registerGuidelineResources(server); // Widget development guidelines
}
```

Resources are loaded from `docs/` directory and exposed via URIs like `resource://guidelines/property-types`.

### Widget Generator Integration

The `create-widget` tool uses `node-pty` to interact with the Mendix widget generator CLI. Key implementation details:

- **PTY Simulation**: Required because the generator uses interactive prompts
- **Prompt Detection**: Matches expected prompts in terminal output
- **Answer Automation**: Sends pre-configured answers based on user input
- **Progress Tracking**: Reports progress via MCP notifications

## Development Commands

```bash
pnpm dev          # Development mode with hot reload (tsx watch)
pnpm build        # TypeScript compilation + path alias resolution (preserves shebang)
pnpm start        # Build and run (HTTP mode on port 3100)
pnpm start:stdio  # Build and run (STDIO mode)
pnpm lint         # ESLint check
```

## Adding New Tools

1. **Create tool file**: `src/tools/my-feature.tools.ts`

```typescript
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const myToolSchema = z.object({
    param: z.string().describe("Parameter description for LLM")
});

export function registerMyTools(server: McpServer): void {
    server.tool(
        "my-tool", // Tool name
        "Description shown to LLM", // Tool description
        myToolSchema, // Input validation schema
        async ({ param }) => {
            // Handler with typed args
            // Implementation
            return {
                content: [
                    {
                        type: "text",
                        text: "Success message"
                    }
                ]
            };
        }
    );

    console.error("[my-feature] Registered 1 tool");
}
```

2. **Register in index**: Update `src/tools/index.ts`

```typescript
import { registerMyTools } from "./my-feature.tools";

export function registerAllTools(server: McpServer): void {
    registerScaffoldingTools(server);
    registerFileOperationTools(server);
    registerBuildTools(server);
    registerMyTools(server); // Add here
}
```

## Code Conventions

### Imports

- Use `@/` path alias for absolute imports from `src/`
- Prefer specific file imports over barrel exports when dealing with circular dependencies
- Group imports: node builtins → external packages → internal modules

### Error Handling

- Use `createErrorResponse()` for user-facing errors
- Log to `console.error` (not stdout) in STDIO mode
- Use `ProgressTracker` for long-running operations

### Type Safety

- All tool inputs must have Zod schemas
- Tool handlers receive fully typed arguments via Zod inference
- Use `McpServer` methods directly for type-safe tool registration

## Testing

Use MCP Inspector for interactive testing:

```bash
# STDIO mode
npx @modelcontextprotocol/inspector node dist/index.js stdio

# HTTP mode
pnpm start
npx @modelcontextprotocol/inspector
# Connect to http://localhost:3100/mcp
```

## Security

All security validation is centralized in `src/security/guardrails.ts` for easy auditing:

```typescript
import { validateFilePath, ALLOWED_EXTENSIONS } from "@/security";

// Validates path traversal and extension whitelist
validateFilePath(widgetPath, filePath, true); // true = check extension
```

### Security Measures

| Protection          | Function                  | Description                                                         |
| ------------------- | ------------------------- | ------------------------------------------------------------------- |
| Path Traversal      | `validateFilePath()`      | Blocks `..` sequences and resolved path escapes                     |
| Extension Whitelist | `isExtensionAllowed()`    | Only allows: `.tsx`, `.ts`, `.xml`, `.scss`, `.css`, `.json`, `.md` |
| Directory Boundary  | `isPathWithinDirectory()` | Ensures files stay within widget directory                          |

When adding file operation tools, always use `validateFilePath()` from the security module.

## Key Files Reference

| File                       | Purpose                                          |
| -------------------------- | ------------------------------------------------ |
| `config.ts`                | Server constants (ports, timeouts, paths)        |
| `security/guardrails.ts`   | Security validation (path traversal, extensions) |
| `tools/index.ts`           | Tool registration aggregation                    |
| `tools/utils/generator.ts` | Widget generator PTY prompts and defaults        |
| `resources/guidelines.ts`  | Widget development guideline resources           |
| `server/session.ts`        | HTTP session lifecycle management                |
| `server/server.ts`         | MCP server factory and registration entry point  |

## Common Patterns

### Progress Notifications

```typescript
const tracker = new ProgressTracker({
    context,
    logger: "my-tool",
    totalSteps: 5
});

tracker.start("initializing");
await tracker.progress(25, "Step 1 complete");
await tracker.info("Detailed log message", { key: "value" });
tracker.stop();
```

### Long-Running Operations

- Use `ProgressTracker` for heartbeat and stuck detection
- Set appropriate timeouts (see `SCAFFOLD_TIMEOUT_MS`)
- Call `tracker.markComplete()` before expected long waits (e.g., npm install)

## Roadmap Context

Current focus is widget scaffolding. Planned additions:

- Widget property editing
- XML configuration management
- Build and deployment automation

When adding features, maintain the existing patterns for tool registration, progress tracking, and transport-agnostic design.
