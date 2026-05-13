@AGENTS.md

# Claude Code

## Hooks (auto-applied)

- **Auto-format**: Every file edit is auto-formatted by prettier via PostToolUse hook.
  Do NOT manually run `prettier --write` — it wastes tokens, the hook handles it.
- **Auto-lint**: After each edit, eslint runs via `pnpm run lint` in the file's package.
  Lint errors are fed back automatically — fix them in the next edit, do NOT run lint commands manually.

## Auto-loaded Documentation

@docs/repo-layout.md
@docs/requirements/tech-stack.md
@docs/requirements/frontend-guidelines.md
@docs/requirements/app-flow.md
@docs/requirements/backend-structure.md
@docs/requirements/project-requirements-document.md
@openspec/specs/

## Agent skills

### Issue tracker

Issues tracked in Jira project `WC` via the Jira MCP server. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary (needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix). See `docs/agents/triage-labels.md`.

### Domain docs

Multi-context layout — `CONTEXT-MAP.md` at root, per-package `CONTEXT.md` + `docs/adr/` files. See `docs/agents/domain.md`.
