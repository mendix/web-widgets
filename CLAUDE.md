@AGENTS.md

# Claude Code

## Hooks (auto-applied)

- **Auto-format**: Every file edit is auto-formatted by prettier via PostToolUse hook.
  Do NOT manually run `prettier --write` — it wastes tokens, the hook handles it.
- **Auto-lint**: After each edit, eslint runs via `pnpm run lint` in the file's package.
  Lint errors are fed back automatically — fix them in the next edit, do NOT run lint commands manually.

## Auto-loaded Documentation

@docs/requirements/tech-stack.md
@docs/requirements/frontend-guidelines.md
@docs/requirements/app-flow.md
@docs/requirements/backend-structure.md
@docs/requirements/project-requirements-document.md
