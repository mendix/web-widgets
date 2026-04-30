# Mendix Web Widgets

Monorepo of official Mendix pluggable web widgets. pnpm workspaces + Turbo.

## Commands

- Install: `pnpm install`
- Build all: `pnpm build`
- Build one: `pnpm --filter @mendix/<name> run build`
- Test one: cd into package dir, run `pnpm run test` (NOT from repo root)
- Lint one: cd into package dir, run `pnpm run lint`
- Changelog: `pnpm -w changelog`

## Structure

```
packages/pluggableWidgets/*-web/  -> Widget packages (React + TS + SCSS)
packages/modules/                 -> Mendix module packages
packages/shared/                  -> Shared configs, plugins, utilities
automation/                       -> Build/release automation
docs/requirements/                -> Detailed technical requirements
```

## Conventions

- TypeScript strict, React functional components + hooks
- Mendix Pluggable Widgets API: EditableValue, ActionValue, ListValue, DynamicValue
- Check ActionValue.canExecute before execute()
- Render loading/empty states until values are ready
- SCSS for styling, prefer Atlas UI classes, BEM-like naming with widget prefix
- Conventional commits enforced: `type(scope): description`
- Semver + CHANGELOG.md per package for runtime/XML/behavior changes
- Jest + RTL for unit tests (src/\*_/**tests**/_.spec.ts)
- Playwright for E2E (e2e/\*.spec.js)

## Development Setup

- Node >=22, pnpm 10.x
- Set MX_PROJECT_PATH to Mendix project dir for live reload
- Run `pnpm start` inside widget package for dev build

## Constraints

- Never modify dist/, generated files, or lockfiles
- XML property keys: lowerCamelCase, must match TypeScript props exactly
- Don't override core Atlas UI classes
- Prefer tree-shakable imports for new dependencies

## Documentation

Essential reading (consult for any widget work):
- docs/requirements/tech-stack.md — Full technology stack
- docs/requirements/frontend-guidelines.md — CSS/SCSS/Atlas UI guidelines
- docs/requirements/app-flow.md — Widget lifecycle and Studio Pro integration
- docs/requirements/backend-structure.md — Data flow and Mendix runtime
- docs/requirements/project-requirements-document.md — Goals and scope

Reference (consult on demand for specific tasks):
- docs/requirements/implementation-plan.md — New widget guide + PR template
- docs/requirements/widget-to-module.md — Widget-to-module conversion guide

## Agent-Specific Instructions

- **Claude Code** — See `CLAUDE.md` for hooks and auto-imported documentation
- **GitHub Copilot** — See `.github/copilot-instructions.md` for PR review guidelines
- **Cursor / Windsurf** — Use docs/requirements/ files as rule sources (YAML frontmatter compatible)
