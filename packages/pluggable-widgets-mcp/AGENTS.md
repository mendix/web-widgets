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
├── server/
│   ├── server.ts         # MCP server factory and tool registration
│   ├── http.ts           # HTTP transport setup (Express)
│   ├── stdio.ts          # STDIO transport setup
│   ├── routes.ts         # Express route handlers
│   └── session.ts        # HTTP session management
└── tools/
    ├── index.ts          # Tool aggregation
    ├── types.ts          # MCP tool type definitions
    ├── scaffolding.tools.ts  # Widget creation tool
    └── utils/
        ├── generator.ts      # Widget generator PTY wrapper
        ├── progress-tracker.ts # Progress/logging helper
        ├── notifications.ts  # MCP notification utilities
        └── response.ts       # Tool response helpers
```

## Architecture

### Transport Layer

The server supports two transport modes selected via CLI argument:

- **HTTP** (default): Multi-session Express server on port 3100
- **STDIO**: Single-session stdin/stdout for CLI integration

### Tool Registration

Tools are defined using the `ToolDefinition<T>` interface:

```typescript
interface ToolDefinition<T> {
    name: string; // Tool identifier
    title: string; // Human-readable name
    description: string; // LLM-facing description
    inputSchema: ZodType<T>; // Zod schema for validation
    handler: ToolHandler<T>; // Async handler function
}
```

New tools should be:

1. Created in `src/tools/` with a `*.tools.ts` suffix
2. Export a `get*Tools()` function returning `ToolDefinition[]`
3. Registered in `src/tools/index.ts`

### Widget Generator Integration

The `create-widget` tool uses `node-pty` to interact with the Mendix widget generator CLI. Key implementation details:

- **PTY Simulation**: Required because the generator uses interactive prompts
- **Prompt Detection**: Matches expected prompts in terminal output
- **Answer Automation**: Sends pre-configured answers based on user input
- **Progress Tracking**: Reports progress via MCP notifications

## Development Commands

```bash
pnpm dev          # Development mode with hot reload (tsx watch)
pnpm build        # TypeScript compilation + path alias resolution
pnpm start        # Build and run (HTTP mode)
pnpm start:stdio  # Build and run (STDIO mode)
pnpm lint         # ESLint + Prettier check
```

## Adding New Tools

1. **Create tool file**: `src/tools/my-feature.tools.ts`

```typescript
import { z } from "zod";
import type { ToolDefinition, ToolResponse } from "@/tools/types";
import { createToolResponse, createErrorResponse } from "@/tools/utils/response";

const mySchema = z.object({
    param: z.string().describe("Parameter description for LLM")
});

type MyInput = z.infer<typeof mySchema>;

export function getMyTools(): ToolDefinition<MyInput>[] {
    return [
        {
            name: "my-tool",
            title: "My Tool",
            description: "What this tool does (shown to LLM)",
            inputSchema: mySchema,
            handler: async (args, context) => {
                // Implementation
                return createToolResponse("Success message");
            }
        }
    ];
}
```

2. **Register in index**: Update `src/tools/index.ts`

```typescript
import { getMyTools } from "./my-feature.tools";

export function getAllTools(): AnyToolDefinition[] {
    return [
        ...getScaffoldingTools(),
        ...getMyTools() // Add here
    ];
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
- Use `ToolContext` for MCP-provided context (notifications, progress)
- Avoid `any` except in `AnyToolDefinition` (required for heterogeneous tool arrays)

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

## Key Files Reference

| File                       | Purpose                                |
| -------------------------- | -------------------------------------- |
| `config.ts`                | All constants (ports, timeouts, paths) |
| `tools/types.ts`           | MCP tool type definitions              |
| `tools/utils/generator.ts` | Widget generator prompts and defaults  |
| `server/session.ts`        | HTTP session lifecycle management      |

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
