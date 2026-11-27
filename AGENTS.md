# Mendix Web Widgets

Monorepo of official Mendix pluggable web widgets. pnpm workspaces + Turbo.

## Conventions

- TypeScript strict, React functional components + hooks
- Mendix Pluggable Widgets API: EditableValue, ActionValue, ListValue, DynamicValue
- Check ActionValue.canExecute before execute()
- Render loading/empty states until values are ready
- SCSS for styling, prefer Atlas UI classes, BEM-like naming with widget prefix
- Conventional commits enforced: `type(scope): description`
- Semver + CHANGELOG.md per package for pluggable widgets and modules, not for shared packages
- Changelogs for users: include only widget behavior, not implementation details
- Changelogs added during development, version bumps only at release time
- Jest + RTL for unit tests (src/\*_/**tests**/_.spec.ts)
- Playwright for E2E (e2e/\*.spec.js)

## Code Comments

Keep comments to a minimum. Code says what it does. A comment explains only why, when the code can't.

- **Keep:** a reason the code can't show, such as a Mendix runtime or browser quirk, a third-party bug, or a non-obvious ordering constraint. Link the issue when one exists.
- **Keep:** doc comments on exports of shared packages, and license headers.
- **Keep:** lint suppressions that give a reason: `// eslint-disable-next-line <rule> -- <why>`.
- **Remove:** narration of what the next line does, section banners, commented-out code, and `TODO`s without an issue link.
- When code in this repo needs a comment to be understood, prefer a better name, an extracted function, or a narrower type over the comment.

## Testing

Test behavior, not implementation. Assert what users of the code can observe: rendered output and ARIA state, values passed to `setValue`, executed actions, and a store's public state. Don't assert private helpers, internal call order, or intermediate data.

Judge each test against two imaginary edits:

- **Break the behavior** (a wrong value, an action skipped or run twice). The test must fail. If it still passes, it proves nothing. The usual causes are a loose assertion, an expected value computed by the code under test, or an assertion on data the test built itself.
- **Change only the internals** and keep every observable result. The test must still pass. If it fails, it's pinned to the implementation.

Drive components through RTL queries and user events. Derive expected values from the requirement. Pair "this never happens" with a case where it does.

Mock Mendix values the way the client delivers them: after `setValue` or any other change, re-render with a new object from the builder (`builder.build()`) and assert the value passed to `setValue`, not `.value` on the old object.

## E2E Test Rules (Playwright)

- docs/requirements/e2e-test-guidelines.md — Full rules + template

## Development Setup

- Node >=26, pnpm 12.x
- Set MX_PROJECT_PATH to Mendix project dir for live reload
- Run `pnpm start` inside widget package for dev build

## Constraints

- Never edit dist/, generated files, or lockfiles by hand. Changes their tools make are fine:
  `pnpm add`/`pnpm remove` updating `pnpm-lock.yaml`, or a generator rewriting its output.
  Commit those changes with the change that caused them.
- OpenSpec specs/changes are PER-PACKAGE — never create them at the monorepo root.
  Always `cd packages/<type>/<name>` before any `openspec new/init/archive`. The
  root `openspec/` directory is off-limits (enforced by `.claude/hooks/validate-openspec-path.sh`).
- XML property keys: lowerCamelCase, must match TypeScript props exactly
- Don't override core Atlas UI classes
- Prefer tree-shakable imports for new dependencies

## Documentation

Essential reading (consult for any widget work):

- docs/repo-layout.md — To understand the repository
- docs/widget-scripts.md - How to build/test/lint packages
- docs/requirements/tech-stack.md — Full technology stack
- docs/requirements/frontend-guidelines.md — CSS/SCSS/Atlas UI guidelines
- docs/requirements/app-flow.md — Widget lifecycle and Studio Pro integration
- docs/requirements/backend-structure.md — Data flow and Mendix runtime
- docs/requirements/project-requirements-document.md — Goals and scope

Reference (consult on demand for specific tasks):

- docs/requirements/implementation-plan.md — New widget guide + PR template
- docs/requirements/widget-to-module.md — Widget-to-module conversion guide
- docs/requirements/e2e-test-guidelines.md — E2E test reliability rules + template

## Agent-Specific Instructions

- **Claude Code** — See `CLAUDE.md` for hooks and auto-imported documentation
- **GitHub Copilot** — See `.github/copilot-instructions.md` for PR review guidelines
- **Cursor / Windsurf** — Use docs/requirements/ files as rule sources (YAML frontmatter compatible)
