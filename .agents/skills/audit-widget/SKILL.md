---
name: audit-widget
description: Audit one Mendix pluggable widget across seven categories (unit tests, e2e, performance, dependencies, code smells, missing behaviours, mx-docs drift) into a resumable AUDIT.md, then fix one category at a time, stopping after each for review and commit.
---

# Audit Widget

Two-phase, resumable health check for one widget package. Phase 1 produces a report; Phase 2 fixes it **one category at a time and stops**.

The report file is the state machine. Everything needed to resume lives in it, so a fresh session can continue an audit it did not start.

## Invocation

```
/audit-widget <widget>                 # Phase 1 — generate/refresh the report
/audit-widget <widget> fix             # Phase 2 — fix the next pending category, then STOP
/audit-widget <widget> fix <category>  # Phase 2 — fix a specific category, then STOP
/audit-widget <widget> skip <category> # mark a category skipped, change nothing else
/audit-widget <widget> status          # print the category table, change nothing
```

`<widget>` is a folder name under `packages/pluggableWidgets/` (e.g. `combobox-web`) or `packages/modules/` (e.g. `data-widgets`). If it is missing or ambiguous, ask — do not guess.

`<category>` is one of: `unit-tests`, `e2e-tests`, `performance`, `dependencies`, `smells`, `behaviours`, `docs`.

**Mode resolution:** no mode word → Phase 1. If `AUDIT.md` already exists and Phase 1 is requested again, ask whether to refresh it (re-audit, preserving `fixed`/`skipped` statuses) or to switch to `fix`.

## Scope discipline

- Audit **one package**. Read files under `packages/<type>/<widget>/` only.
- Follow findings into `@mendix/widget-plugin-*` / shared packages **only** when the widget's own code cannot explain a finding — and say so explicitly in the finding. Never fix shared-package code as part of a widget audit; raise it as a separate note.
- Dependency analysis uses **only that widget's `package.json`**. Never the root, never another package.
- Never touch `dist/`, generated files (`typings/*.d.ts`), or lockfiles.
- **The one exception is `docs`**: it reads — and in Phase 2 edits — the widget's page in the mx-docs repo. Resolve its location as `$MX_DOCS_PATH`, else `~/Projects/mx-docs`. If neither exists, mark `docs` as `skipped` with the reason in Notes; do not guess another path. Never edit any other mx-docs page than the widget's own (and its `_index.md` only if the page is a section).

## Phase 1 — Report

### 1. Orient (cheap, always do this first)

```bash
cd packages/pluggableWidgets/<widget>
```

Read, in this order:

1. `package.json` — deps, scripts, `widgetName`, `marketplace.minimumMXVersion`
2. `AGENTS.md` if present — the widget's own architecture map, the highest-value context you will get
3. `src/<WidgetName>.xml` — the property contract; this is the source of truth for expected behaviour
4. `CHANGELOG.md` — recent behaviour changes, unreleased entries
5. `openspec/specs/**` and `openspec/changes/**` — declared requirements and in-flight work
6. Inventory (do not read contents yet):
    ```bash
    find src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.scss" \) | sort
    find src -path "*__tests__*" -name "*.spec.*" | sort
    ls e2e/*.spec.js
    ```
7. The mx-docs page for the widget — locate it now (lookup recipe in the `DOCS` section of [checklists.md](checklists.md)) and record its path in the report header. Do not read it in full yet.

### 2. Run the seven checks

Detection heuristics for each live in [checklists.md](checklists.md). Read it now — it is the substance of this skill.

| Category           | ID prefix | What it answers                                                     |
| ------------------ | --------- | ------------------------------------------------------------------- |
| Unit tests         | `UT`      | Which modules/branches/states have no Jest+RTL coverage?            |
| E2E tests          | `E2E`     | Which user-visible flows have no Playwright spec, or a fragile one? |
| Performance        | `PERF`    | What causes avoidable renders, work-in-render, or leaks?            |
| Dependencies       | `DEP`     | Patch/minor/major updates available for this widget's own deps      |
| Code smells        | `SMELL`   | Violations of repo conventions, dead code, type escapes             |
| Missing behaviours | `BEH`     | XML/API/a11y contract the implementation does not honour            |
| Public docs        | `DOCS`    | Where the mx-docs page disagrees with the XML, changelog, or code   |

Parallelising is allowed and encouraged here: dispatch one read-only `Explore` agent per category with the package path plus that category's section of `checklists.md`, then merge results. Keep `dependencies` for yourself — it needs a command run, not a search.

### 3. Verify before writing

Every finding must survive this filter, or it does not go in the report:

- **Evidence**: a `file:line` you actually read, or command output you actually ran.
- **Failure scenario**: concrete inputs/config → wrong or slow result. "Could be cleaner" is not a finding.
- **Not already handled**: check the code path once more for the guard you are claiming is absent.
- **Not a shared-package concern** misattributed to the widget.
- **Not handled by a library**: when the finding depends on how a framework or library behaves (for example, a callback captured by `useEditor(..., [])`), read that library's code in `node_modules` before reporting it. `@tiptap/react` forwards callbacks to the latest options, which made BEH-01 in the example report a false positive.
- **Critical needs proof**: report a finding as Critical only after a failing test or a runtime reproduction. Otherwise report it as High and add _needs repro_.

Drop speculative findings silently. A short true report beats a long plausible one.

A real report produced by this skill is in [examples/rich-text-web.AUDIT.md](examples/rich-text-web.AUDIT.md), including findings later marked `fixed`, `stale` and added by tests.

### 4. Write the report

Write to `packages/<type>/<widget>/AUDIT.md` using [report-template.md](report-template.md). Then print to the user: the category table, the finding counts per severity, and the 3 findings you would fix first.

**Stop there.** Phase 1 never edits source, never installs, never commits.

## Phase 2 — Fix, one category, then stop

### Order

`unit-tests` → `e2e-tests` → `performance` → `dependencies` → `smells` → `behaviours` → `docs`

Tests come first on purpose: they are the safety net for the later categories. `docs` comes last because the earlier categories can change behaviour the docs must then describe. If the user asks for a later category first, do it — but say in one line that the test net is not in place yet.

### Per-category loop

1. **Resolve the category.** Explicit arg wins; otherwise the first row in the table whose status is `pending`. If none are pending, report that the audit is complete and stop.
2. **Set status to `in-progress`** in `AUDIT.md`.
3. **Plan.** List the findings you will address, in order, and the ones you are deliberately leaving (with why). If the category has more than ~6 findings, propose a cut line and ask before starting — a 20-file change is not reviewable in one sitting.
4. **Fix.** Work finding by finding. Follow `AGENTS.md`, `docs/requirements/frontend-guidelines.md`, and for e2e work `docs/requirements/e2e-test-guidelines.md`. Prettier and ESLint run automatically on edit — do not invoke them manually.
5. **Verify.** From the package root:
    - always: `pnpm run test`. To run a single spec, use `pnpm run test --testPathPatterns <name> --coverage=false`; a bare path argument does not filter, because the script is `jest --projects jest.config.js`.
    - `unit-tests`: if a correct assertion fails because the widget is wrong, do not assert the broken behaviour and do not leave an `it.todo`. Add the bug to the report as a new finding (next free ID in the right category, marked _found by tests_) and leave the test out until the fix PR.
    - `e2e-tests`: `pnpm run release` then `pnpm run e2e --no-setup-project`. If Docker or the test project is unavailable, say so plainly and leave the specs as written-but-unverified — do not claim a pass you did not see.
    - `dependencies`: `pnpm run test` **and** `pnpm turbo build`
    - `performance`, `behaviours`: `pnpm run test`; add or update a test that would have caught the issue
    - `docs`: no widget command. Instead, before editing, confirm the mx-docs working tree is clean and not on its default branch (`development`); if it is, create a local branch `docs/<widget>-sync` — never edit on the default branch, never push. Edit following mx-docs `CLAUDE.md` and its style guide (it takes precedence over this repo's conventions inside mx-docs). Afterwards run `npx markdownlint-cli2 <page>` from the mx-docs root if available, and re-read every changed `{#anchor}` / URL with a grep for inbound references.
6. **Changelog.** If widget behaviour changed, add an entry under `## [Unreleased]` in the package `CHANGELOG.md`. User-facing wording only — no implementation detail. Do **not** bump the version. Pure test-only or dependency-only changes with no user-visible effect get no entry. `docs` never adds a widget changelog entry.
7. **Update `AUDIT.md`**: set each addressed finding's status to `fixed` (or `skipped` with a reason), set the category status to `done`, and append a line to the Log section: `<date> — <category> — N fixed, M skipped`.
8. **HALT.**

### The halt is the point

After one category, you are finished for this invocation. That means:

- Do **not** start the next category, even if it looks trivial or related.
- Do **not** `git add`, `git commit`, `git push`, or open a PR. The user commits.
- Do **not** ask "shall I continue?" — the user will invoke the skill again when ready.

Print exactly this shape and then end the turn:

```
✅ <category> — N fixed, M skipped
   <one line per fixed finding: ID — what changed, file>

Verification: <command run> → <result>
Next pending: <category> (K findings)

Suggested commit:
<type>(<widget>): <subject>
```

Commit `type` by category: `unit-tests`/`e2e-tests` → `test`, `performance` → `perf`, `dependencies` → `chore`, `smells` → `refactor`, `behaviours` → `fix` or `feat`. Scope is the folder name (`combobox-web`).

For `docs` the commit lives in the **mx-docs** repo, not this one: print the mx-docs branch name and a plain subject line (mx-docs does not use conventional commits), e.g. `Combo box: document <prop>, sync Properties Pane with v2.4.0`.

## Resuming cold

If `AUDIT.md` exists and you have no memory of writing it: trust it. Read it, read the widget's `AGENTS.md`, then act on the requested mode. Re-verify a finding's `file:line` before fixing it — the file may have moved since the report was written. If a finding no longer reproduces, mark it `stale` with a one-line note rather than inventing a fix.
