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
@openspec/specs/conventions/spec.md
@openspec/schemas/mendix-widget/schema.yaml

## OpenSpec

Per-widget `openspec/` directories exist inside widget packages that have been initialized
(e.g., `packages/pluggableWidgets/datagrid-web/openspec/`). When working inside a widget
directory, check for `openspec/specs/spec.md` as the source of truth for current behavior,
and `openspec/changes/` for any active change proposals. Use `/opsx:propose` before
implementing non-trivial behavior changes.
