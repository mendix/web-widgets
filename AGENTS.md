# Mendix Web Widgets Repository

Monorepo of official Mendix pluggable web widgets. pnpm workspaces + Turbo.

## Structure

- `packages/pluggableWidgets/*-web` — Widget packages (React, TypeScript, SCSS)
- `packages/modules/*` — Mendix module packages
- `packages/shared/*` — Shared configs and utilities
- `automation/` — Build and release automation
- `docs/requirements/` — Detailed technical requirements

## Commands

| Command | Description |
|---------|-------------|
| `pnpm install` | Install dependencies |
| `pnpm build` | Build all packages |
| `pnpm lint` | Lint all packages |
| `pnpm test` | Test all packages |
| `pnpm --filter @mendix/<name> run <script>` | Run script in one package |

## Conventions

- TypeScript + React functional components + SCSS
- Mendix Pluggable Widgets API (EditableValue, ActionValue, ListValue)
- Atlas UI design system for styling
- Conventional commits (commitlint enforced)
- Semver versioning + CHANGELOG.md per package

## Agent-Specific Instructions

- **Claude Code** — See `CLAUDE.md` for hooks, commands, and detailed instructions
- **GitHub Copilot** — See `.github/copilot-instructions.md` for PR review guidelines
- **Cursor / Windsurf** — See `docs/requirements/` for rule files (YAML frontmatter compatible)
