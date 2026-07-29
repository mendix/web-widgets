# Pluggable Widgets MCP Server — Deep Reference

Companion to `SKILL.md`. Read that first for the mental model.

## Module inventory (30 source files)

### Entry & config

- `src/index.ts` — validates `argv[2]` against `["stdio","http"]`, `--help`/`-h`, exits 1 on an
  unknown transport (an unchecked cast used to fall through to stdio, so `htpp` started a server
  speaking the wrong protocol).
- `src/config.ts` — `SERVER_NAME`, `PORT`, `SERVER_ICON`, `SERVER_INSTRUCTIONS`, `PACKAGE_ROOT`,
  `SERVER_VERSION` (degrades to `0.0.0` rather than killing module eval), `DOCS_DIR`,
  `SCAFFOLD_TIMEOUT_MS` (60s) / `INSTALL_TIMEOUT_MS` (5m) / `BUILD_TIMEOUT_MS` (5m),
  `getConfiguredProjectDir()`, `widgetSourcesDir(projectDir)`, `validateProjectDir(dir)`,
  `ProjectValidation`.
    - `getConfiguredProjectDir()` is a **function**, not a const — a module-load const let three
      modules capture a stale copy. The live value is `state.projectDir`.
    - `validateProjectDir` sorts `.mpr` matches and errors on more than one, rather than taking
      whichever `readdir` returned first.

### Server layer (`src/server/`)

- `server.ts` — `createMcpServer()`. Capabilities: `logging`, `resources`, `tools`. **No `prompts`** —
  it was advertised with none registered, which makes `prompts/list` look empty rather than
  unsupported.
- `stdio.ts` — production transport. Shuts down on SIGINT, SIGTERM, **and stdin `end`/`close`** — the
  last is how a stdio child learns its host died; without it the process outlives Studio Pro, and on
  Windows the signals are not delivered as POSIX code expects.
- `http.ts` — binds `127.0.0.1` explicitly, handles `EADDRINUSE` with a clear message. No `cors`
  dependency; the SDK's `createMcpExpressApp({ host })` installs DNS-rebinding protection for loopback.
- `routes.ts` — **stateless**. `POST /mcp` builds a transport + server per request
  (`sessionIdGenerator: undefined`), disposes on `res.close`. `GET`/`DELETE` → 405. `OPTIONS` → 204.
  `GET /health` → `{ status, server, version, projectConfigured }` — deliberately no project path
  (unauthenticated endpoint) and no session count (there are none).
- `log-project-config.ts` — one helper, sinks injected. STDIO passes `(log.info, log.info)` because
  stdout is the protocol channel; HTTP passes `(log.info, log.warn)`. Tagging is the sink's job.

**Deleted:** `session.ts` / `SessionManager` (the map could never be emptied — DELETE carries no body,
so the handler threw before reaching the transport; a raw GET minted an `McpServer` that was never
registered or closed) and `protocol-logger.ts` (synchronous `appendFileSync` per request, HTTP-only,
half-wired). There is no `mcp-session-logs/` directory any more.

### Tools (`src/tools/`)

- `project.tools.ts` — `get-project-info`, `set-project-directory`, `deploy-widget`.
- `scaffolding.tools.ts` — `create-widget`. Verifies an existing directory's `package.json`
  `widgetName` before reporting a skip as success. Categorises failures by **type**
  (`ScaffoldTimeoutError`, `MissingAnswerError`, `InvalidAnswerError`, `err.code === "ENOENT"/"EACCES"`),
  never by matching message text.
- `widget-properties.tools.ts` — `set-widget-properties`. Resolves the widget name from
  `package.json`'s `widgetName`; the directory basename is a poor fallback (`my-widget` → `My-widget`
  fails PascalCase and blames the user for a name they never chose).
- `file-operations.tools.ts` — `list/read/write-widget-file`. Validates **every** path before writing
  **any**. A partial write returns `fail`, not `ok` — it used to return a success envelope with
  "Partial success" in the text, so a client checking `isError` saw a clean write.
- `build.tools.ts` — `build-widget`.
- `property-schema.ts` — the single Zod property model: `propertyDefinitionSchema`,
  `propertyGroupSchema`, `systemPropertySchema`, `enumValueSchema`, `PROPERTY_TYPES`,
  `ATTRIBUTE_TYPES`, `SYSTEM_PROPERTIES`, `parseMaybeStringifiedArray`. Lives under `tools/` because
  `generators/` is deliberately Zod-free.
- `types.ts` — `ToolResponse` (type alias — see SKILL.md), `ToolContext`, `widgetOptionsSchema`,
  `DEFAULT_WIDGET_OPTIONS`, `WidgetOptions`.
- `session-state.ts` — `SessionState`, `createSessionState()`.

**Deleted:** `code-generation.tools.ts` and `property-update.tools.ts`, merged into
`widget-properties.tools.ts`. With them went `generatePropertySuggestions` (keyword matching that
produced duplicate keys), `detectTemplateMismatch` (a linter that ran _after_ writing files) and
`cleanupScaffoldFiles` (undisclosed `unlink` of unrelated files in `src/`, errors uncaught mid-loop).

### Utilities (`src/tools/utils/`)

- `answer-adapter.ts` — `AnswerAdapter`, `MissingAnswerError`, `InvalidAnswerError`. See SKILL.md.
- `generator.ts` — `runWidgetGenerator`, `runNpmInstall`, `buildWidgetOptions`,
  `buildGeneratorAnswers`, `ScaffoldTimeoutError`, `ScaffoldResult`, `InstallResult`,
  `SCAFFOLD_PROGRESS`. `yeoman-environment` is imported lazily so the STDIO path does not pay for its
  dependency graph unless a widget is scaffolded.
- `response.ts` — `ok`, `fail`, `ErrorCode`, `FailureContext`. 500-char detail truncation.
- `sandbox.ts` — `allowedRoots`, `isPathAllowed`, `describeAllowedRoots`.
- `logger.ts` — `createLogger(tag)`, `MCP_LOG_LEVEL`.
- `mpk.ts` — `findMpkFile(widgetPath)`: recursive under `dist/`, returns the **newest by mtime**. It
  used to return whichever `readdirSync` yielded first, so with `dist/1.0.0/` and `dist/1.0.1/` both
  present `deploy-widget` could copy the stale artifact — and succeed silently.
- `notifications.ts`, `progress-tracker.ts` — client-facing progress and log messages.

**Deleted:** `mpk-analyzer.ts` (no production callers; `execSync("unzip …")` interpolated a
caller-supplied path and needed a binary absent on Windows).

### Generators (`src/generators/`)

- `xml-generator.ts` — `generateWidgetXml`, `validateWidgetDefinition`. Pure, fs-free, Zod-free.
  Validation covers PascalCase name, camelCase keys, **duplicate keys**, `attributeTypes` on
  `attribute`, `enumValues` on `enumeration`, and property groups referencing unknown keys.
- `types.ts` — `WidgetDefinition`, `PropertyDefinition`, `PropertyGroup`, `SystemProperty`,
  `MendixPropertyType`, `AttributeType`.

**Deleted:** `tsx-generator.ts`. It hand-assembled React by string concatenation and emitted
non-compiling code in at least four cases (container calling `useCallback` without importing it;
`isCollapsible` falling back to the _string_ `"false"` spliced into source; enum compared to a raw
string; unused destructured props tripping `noUnusedLocals`). `docs/widget-patterns.md` covers the
same ground properly and is served as a resource.

### Resources (`src/resources/`)

- `guidelines.ts` — `GUIDELINE_RESOURCES`, `loadGuidelineContent(filename)`, module-level cache.
- Serves `mendix://guidelines/property-types` (`docs/property-types.md`) and
  `mendix://guidelines/widget-patterns` (`docs/widget-patterns.md`) from `DOCS_DIR`.
- `docs` is in `package.json` `files` — without it these throw ENOENT in an installed copy.

## Test inventory (14 files, 119 tests)

| File                                                  | Covers                                                                               |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `src/__tests__/config.test.ts`                        | `validateProjectDir`                                                                 |
| `src/__tests__/scenarios/widget-lifecycle.test.ts`    | Multi-tool workflows through the harness                                             |
| `src/generators/__tests__/xml-generator.test.ts`      | XML output per property type + all validation rules                                  |
| `src/resources/__tests__/guidelines.test.ts`          | Both guidelines load from disk                                                       |
| `src/security/__tests__/guardrails.test.ts`           | Traversal, prefix attacks (`/widgets/foobar` vs `/widgets/foo`), extension allowlist |
| `src/tools/__tests__/build.tools.test.ts`             | Sandbox checks, failure/success formatting                                           |
| `src/tools/__tests__/file-operations.tools.test.ts`   | list/read/write, validate-all-before-writing-any                                     |
| `src/tools/__tests__/project.tools.test.ts`           | Project config + real `.mpk` deploy                                                  |
| `src/tools/__tests__/scaffolding.tools.test.ts`       | Sandbox + `widget-sources` default                                                   |
| `src/tools/__tests__/widget-properties.tools.test.ts` | XML written, declarative replacement, invalid definitions write nothing              |
| `src/tools/utils/__tests__/answer-adapter.test.ts`    | Answer precedence, `when` guards, `validate`, never-stdout                           |
| `src/tools/utils/__tests__/generator.test.ts`         | **Real in-process scaffold**; pins all 14 prompt names                               |
| `src/tools/utils/__tests__/mpk.test.ts`               | `findMpkFile`                                                                        |
| `src/tools/utils/__tests__/response.test.ts`          | `ok`/`fail` envelope, code rendering, truncation                                     |

`generator.test.ts` is the guard against upstream generator drift — if `@mendix/generator-widget`
renames a prompt, it fails there instead of silently producing a working-but-wrong widget.

## Transports

- STDIO: `StdioServerTransport`. Production. stdout is JSON-RPC only.
- HTTP: `StreamableHTTPServerTransport` with `sessionIdGenerator: undefined` (stateless). No
  `mcp-session-id` handling, no `isInitializeRequest` branching — every POST is self-contained.

## Widget id ↔ bundle path

`xml-generator.ts:120` — `widget.id ?? \`${organization}.${widgetNameLower}.${widget.name}\``, e.g.
`mendix.counter.Counter`. Studio Pro converts dots to slashes to locate the bundle:
`mendix/counter/Counter.js`, which must exist inside the `.mpk`.

A mismatch surfaces in Studio Pro as an **"ES6 modules" error**. The historical failure was
`com.mendix.widget.custom.counter.Counter`, which sends Studio Pro looking for
`com/mendix/widget/custom/counter/Counter.js`.

## MPK structure

A `.mpk` is a ZIP containing `package.xml` (client module name, version, widgetFile path), the widget
`.xml` (properties definition), and the JS bundle (AMD `define(` or ESM `export`).

## Conventions

- `@/` → `src/`; imports use no `.js` suffix internally (`tsc-alias` resolves at build).
- Every failure goes through `fail(code, …)`. No raw response literals.
- Tool modules export `registerXxxTools(server, state?)`.
- Vitest, not Jest. `restoreMocks: true` — see the SKILL.md trap.
- Logging via `createLogger`, never bare `console.*` — stdout is the protocol channel.
- Categorise errors by type or `err.code`, never by matching message text.
