---
name: pluggable-widgets-mcp
description: Use when working on the pluggable-widgets-mcp package — adding tools, writing tests, debugging the server, or understanding the widget lifecycle pipeline.
---

## Project Location

`packages/pluggable-widgets-mcp/` in the `web-widgets` monorepo. All paths below are relative to it.

## Mental model — read this before changing anything

> The server does what is mechanically derivable. The client LLM does what requires judgment.
> The resources tell it how.

XML generation is the server's job: a deterministic transformation of a property model against a
fixed schema. **Component `.tsx` is not** — the model writes it via `write-widget-file`, guided by
`docs/widget-patterns.md`, which ships as an MCP resource. An in-process TSX generator used to exist
and was deleted; it emitted code that did not compile. Do not reintroduce one.

The server runs as a **child process of Mendix Studio Pro over STDIO**. HTTP is for MCP Inspector
debugging only: stateless, bound to `127.0.0.1`.

**The Mendix project directory is the single sandbox root.** Nothing derives from `process.cwd()` —
that used to move the security boundary depending on who spawned the process.

## Pipeline

```
get-project-info → create-widget → set-widget-properties → write-widget-file → build-widget → deploy-widget
                   (Yeoman)        (XML)                    (model writes TSX)   (.mpk)         (→ project/widgets/)
```

Widgets scaffold into `{MENDIX_PROJECT_DIR}/widget-sources/<name>/`.

## Key entry points

| File                   | Role                                                                               |
| ---------------------- | ---------------------------------------------------------------------------------- |
| `src/index.ts`         | Entry point — validates `argv[2]` (`stdio` \| `http`), `--help`                    |
| `src/server/server.ts` | `createMcpServer()` — registers tools + resources                                  |
| `src/tools/index.ts`   | `registerAllTools(server, state)`, ordered by pipeline stage                       |
| `src/config.ts`        | `getConfiguredProjectDir()`, `widgetSourcesDir()`, timeouts, `SERVER_INSTRUCTIONS` |

## Tool map (9 tools)

| File                         | Tools                                                        | Takes `state`? |
| ---------------------------- | ------------------------------------------------------------ | -------------- |
| `project.tools.ts`           | `get-project-info`, `set-project-directory`, `deploy-widget` | Yes            |
| `scaffolding.tools.ts`       | `create-widget`                                              | Yes            |
| `widget-properties.tools.ts` | `set-widget-properties`                                      | No             |
| `file-operations.tools.ts`   | `list-widget-files`, `read-widget-file`, `write-widget-file` | No             |
| `build.tools.ts`             | `build-widget`                                               | Yes            |

`SessionState` is `{ projectDir: string | undefined }` (`src/tools/session-state.ts`), seeded from
`MENDIX_PROJECT_DIR` and re-pointable by `set-project-directory`. Tools that resolve paths against
the sandbox or spawn processes take it; the rest are fenced by `validateFilePath` alone.

`set-widget-properties` is **declarative** — callers send the complete property set, not a diff. It
replaced `generate-widget-code` + `update-widget-properties`, which shared a
`.widget-definition.json` snapshot on disk that could disagree with the XML.

## Adding a new tool

```ts
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ToolResponse } from "@/tools/types";
import { createLogger } from "@/tools/utils/logger";
import { fail, ok } from "@/tools/utils/response";
import type { SessionState } from "@/tools/session-state";

const log = createLogger("my-feature");

const schema = z.object({ widgetPath: z.string().min(1).describe("Absolute path to the widget") });

export function registerMyFeatureTools(server: McpServer, state: SessionState): void {
    server.registerTool(
        "my-tool",
        { title: "My Tool", description: "What it does and what it returns.", inputSchema: schema },
        async (args): Promise<ToolResponse> => {
            if (!state.projectDir) {
                return fail("ERR_PROJECT_NOT_CONFIGURED", "No Mendix project is configured.", {
                    suggestion: "Call set-project-directory."
                });
            }
            return ok("Result text");
        }
    );
}
```

Then wire it into `registerAllTools` in `src/tools/index.ts`, at its pipeline position.

**Tool descriptions say what the tool does and returns — nothing about what to call next.** The
workflow lives once in `SERVER_INSTRUCTIONS` (`src/config.ts`). Retry policy prose does not belong in
a description: the server cannot enforce it, and in MCP the client owns the loop.

## Response contract

Exactly two constructors in `src/tools/utils/response.ts`:

```ts
ok(text)
fail(code, message, { suggestion?, file?, line?, column?, details? })
```

`ToolResponse` (`src/tools/types.ts`) is a **type alias, not an interface** — and that is
load-bearing. The SDK's handler signature expects a type carrying an index signature; TypeScript
grants aliases an implicit one, so it stays assignable while excess-property checking still catches a
misspelled `isError`. Changing it to an `interface` breaks every registration site.

Every failure path goes through `fail` with a code. Codes live in the `ErrorCode` union; add one only
when a tool actually emits it. `fail` renders `[ERR_CODE]` into the text, which is all the model sees.

## Path security

Two layers, both rooted at the project directory.

**Sandbox** (`src/tools/utils/sandbox.ts`) — `allowedRoots(state)`, `isPathAllowed(path, state)`,
`describeAllowedRoots(state)`. Roots are `state.projectDir` plus optional `MCP_EXTRA_ALLOWED_PATHS`
(split on `path.delimiter`, not `":"` — that would tear `C:\widgets` in two).

**Guardrails** (`src/security/guardrails.ts`) — `isPathWithinDirectory`, `isExtensionAllowed`,
`validateFilePath(widgetPath, filePath, checkExtension?)` (throws). Pass `checkExtension=true` for
writes. Containment is the whole traversal defence — `resolve()` collapses `../` before comparison,
so there is deliberately no substring test for `".."` (it rejected legitimate names like
`foo..bar.tsx`). Boundary comparisons use `path.sep`, never a hardcoded `"/"`.

Extensions: `.tsx .ts .xml .scss .css .json .md`, plus extensionless `package`/`tsconfig`/`eslintrc`
by **exact filename** and the dot-files `.gitignore .prettierrc .eslintrc .editorconfig`.

## The Yeoman generator — do not reintroduce CLI flags

`@mendix/generator-widget` (registry `^11.11.0`) has **no non-interactive CLI**: it declares zero
`this.option()` calls, `yeoman-generator@8`'s `prompt()` never reads `this.options`, and `.yo-rc.json`
prefill only touches `store: true` prompts and still prompts. A local fork added `--default` to work
around this; the registry version does not have it.

Instead `src/tools/utils/answer-adapter.ts` replaces the Yeoman environment's I/O layer — the
supported extension point. `AnswerAdapter` implements the full `QueuedAdapter` shape (`log`, `prompt`,
`queue`, `progress`, `close`, `abort`, `signal`) because `yeoman-environment` assigns it directly and
does **not** wrap a plain adapter.

Three properties that matter:

- Supplied answer wins → prompt default fills gaps → **missing-and-defaultless throws**
  (`MissingAnswerError`), so an upstream prompt rename fails loudly instead of silently defaulting.
- Nothing writes to stdout. Under STDIO that channel is the JSON-RPC stream.
- Scaffolding **must** target a fresh empty directory. The generator's `end()` hook spawns builds with
  `stdio: "inherit"` when it finds a populated `node_modules` — straight into the protocol channel.

The 14 prompt names are pinned in `src/tools/utils/__tests__/generator.test.ts`. They are the
generator's contract, not ours: `hasUnitTests`/`hasE2eTests` (not `unitTests`/`e2eTests`), and
`copyright` is deliberately unanswered so its own current-year default applies.

`runWidgetGenerator` (in-process, `skipInstall: true`, ~200 ms) and `runNpmInstall` (separate spawn,
own timeout) are separate steps with separately reported outcomes — a registry stall leaves a usable
scaffold.

## Build

`build-widget` success is **the child process's exit code**, never a substring of the output.
`parseBuildOutput` returns `Omit<BuildResult, "success">` so the compiler enforces that it does not
decide success. Failures return `file:line:column`; file contents are not embedded — `read-widget-file`
exists for that.

## Logging

`src/tools/utils/logger.ts` — `createLogger(tag)` → `.debug/.info/.warn/.error`. **Always stderr**;
Studio Pro captures it and that is the support log. Level via `MCP_LOG_LEVEL`. Distinct from
`src/tools/utils/notifications.ts`, which sends `notifications/message` to the _client_.

## Testing

**`npm run test` inside the package directory** — not `pnpm test` from the repo root.

That is the fast layer only. To verify a change end to end — real process, real scaffold, real build,
real `.mpk` — plus timings, use the `mcp-server-test` skill. `docs/evaluation.md` explains what each
layer proves and why.

```ts
import { createMcpTestContext, getResultText, isError } from "@/__test-utils__/mcp-test-harness";
import { registerMyFeatureTools } from "@/tools/my-feature.tools";

const { client, state, cleanup } = await createMcpTestContext(registerMyFeatureTools);
state.projectDir = dir;                       // most tools refuse without one
const result = await client.callTool({ name: "my-tool", arguments: { ... } });
expect(isError(result)).toBe(false);
await cleanup();
```

The harness runs a real client↔server pair over `InMemoryTransport`, so calls go through JSON-RPC
serialization and Zod validation, not direct handler invocation.

**Two traps:**

- The suite runs with `restoreMocks: true`. A `vi.fn()` created inside a `vi.mock` factory is reset
  after the first test, leaving later tests with a stub returning `undefined`. Use **plain functions**
  in module-mock factories.
- Scaffolding is no longer slow — `skipInstall: true` runs in ~200 ms, so prefer a real scaffold over
  mocking `runWidgetGenerator` in new tests.

Fixtures: `createTempMendixProject()`, `createTempWidgetWithMpk()` (`src/__test-utils__/temp-dir.ts`).

## Commands

| Command                                        | Effect                                |
| ---------------------------------------------- | ------------------------------------- |
| `npm run build`                                | `tsc` + `tsc-alias` + chmod           |
| `npm run dev`                                  | Watch via tsx                         |
| `npm run test`                                 | `vitest run`                          |
| `npm run lint`                                 | eslint                                |
| `node dist/index.js stdio`                     | Production transport                  |
| `MENDIX_PROJECT_DIR=… node dist/index.js http` | Inspector debugging, `127.0.0.1:3100` |

## Environment

| Variable                  | Purpose                                                                                 |
| ------------------------- | --------------------------------------------------------------------------------------- |
| `MENDIX_PROJECT_DIR`      | The project. Also the sandbox root. Tools fail `ERR_PROJECT_NOT_CONFIGURED` without it. |
| `MCP_EXTRA_ALLOWED_PATHS` | Extra roots, platform-delimited. Dev only.                                              |
| `MCP_LOG_LEVEL`           | `debug` \| `info` \| `warn` \| `error`                                                  |
| `PORT`                    | HTTP port, default 3100                                                                 |

`@/` → `src/` (tsconfig paths; `vite-tsconfig-paths` in tests, `tsc-alias` in build).

## Deep reference

`.claude/skills/pluggable-widgets-mcp/reference.md` — full module inventory, test inventory,
transport details, MPK structure.
