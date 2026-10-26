---
name: audit-widget
description: Audit one Mendix pluggable widget and write a point-in-time report (AUDIT.md) on unit tests, e2e, performance, dependencies, security, code smells, missing behaviours and mx-docs drift. Report only — it never changes code.
---

# Audit Widget

Writes a health report for **one** widget package. The skill reads code and runs read-only commands. The report is its only output.

## Invocation

```
/audit-widget [<widget>]
```

`<widget>` is a folder name under `packages/pluggableWidgets/` (e.g. `combobox-web`). If it is missing or matches no folder, ask which widget. Do not guess.

Every run is a fresh snapshot. If `AUDIT.md` already exists, replace it without reading it first: audit from scratch so old findings do not anchor the new ones.

## Hard rules

- **The report is the only file you write.** Never edit source, tests, config, `package.json`, docs, or the mx-docs repo. Output that commands write on their own (Jest coverage) is fine.
- **Install nothing.** Never run `pnpm install`, `pnpm add`, `pnpm up` or `pnpm audit --fix`, and never run a script that downloads a tool. They change `package.json` or `pnpm-lock.yaml`, and the repo does not allow lockfile changes.
- **No git writes.** Never `git add`, commit, branch or push. The user decides what to do with the report.
- **Stay in the package.** Read files under `packages/pluggableWidgets/<widget>/` only. Follow a finding into a shared `@mendix/widget-plugin-*` package only when the widget's own code cannot explain it, and record it in Notes, not as a widget finding.
- **mx-docs is read-only.** Read it from `$MX_DOCS_PATH`, else `~/Projects/mx-docs`. If neither exists, skip `DOCS` and say why in Notes.

## 1. Orient

```bash
cd packages/pluggableWidgets/<widget>
git rev-parse --short HEAD   # record in the report header
```

Read, in this order:

1. `package.json` — deps, scripts, `widgetName`, `marketplace`
2. `AGENTS.md` if present — the widget's own architecture map, the highest-value context you will get
3. `src/<WidgetName>.xml` — the property contract; this is the source of truth for expected behaviour
4. `CHANGELOG.md` — recent behaviour changes
5. `openspec/specs/**` and `openspec/changes/**` — declared requirements and in-flight work
6. Inventory (do not read contents yet):
    ```bash
    find src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.scss" \) | sort
    find src -path "*__tests__*" -name "*.spec.*" | sort
    ls e2e/*.spec.js
    ```
7. The mx-docs page for the widget — locate it with the recipe in the `DOCS` section of [checklists.md](checklists.md) and record its path. Do not read it in full yet.

## 2. Run the eight checks

Detection heuristics for each category are in [checklists.md](checklists.md). Read it now — it is the substance of this skill.

| Category           | ID prefix | What it answers                                                              |
| ------------------ | --------- | ---------------------------------------------------------------------------- |
| Unit tests         | `UT`      | Which modules/branches/states have no Jest+RTL coverage?                     |
| E2E tests          | `E2E`     | Which user-visible flows have no Playwright spec, or a fragile one?          |
| Performance        | `PERF`    | What causes avoidable renders, work-in-render, or leaks?                     |
| Dependencies       | `DEP`     | Which of this widget's own deps are outdated or have known advisories?       |
| Security           | `SEC`     | Where can untrusted data reach HTML, URLs, scripts or other dangerous sinks? |
| Code smells        | `SMELL`   | Violations of repo conventions, dead code, type escapes                      |
| Missing behaviours | `BEH`     | XML/API/a11y contract the implementation does not honour                     |
| Public docs        | `DOCS`    | Where the mx-docs page disagrees with the XML, changelog, or code            |

If your agent supports read-only subagents (for example Claude Code's `Explore`), run one per category with the package path and that category's section of `checklists.md`, then merge the results. Run `DEP` yourself — it needs commands, not a search.

## 3. Verify before writing

Every finding must survive this filter, or it does not go in the report:

- **Evidence**: a `file:line` you actually read, or command output you actually ran.
- **Failure scenario**: concrete inputs/config → wrong, slow or unsafe result. "Could be cleaner" is not a finding.
- **Not already handled**: check the code path once more for the guard you are claiming is absent.
- **Not a shared-package concern** misattributed to the widget.
- **Not handled by a library**: when the finding depends on how a framework or library behaves (for example, a callback captured by `useEditor(..., [])`), read that library's code in `node_modules` before reporting it. `@tiptap/react` forwards callbacks to the latest options, which once made a stale-callback finding a false positive.
- **Critical needs proof**: report a finding as Critical only with proof you produced — a failing existing test, command output, or for a leaked secret the line itself. Otherwise report it as High and add _needs repro_.

Drop speculative findings silently. A short true report beats a long plausible one.

## 4. Write the report

Write `packages/pluggableWidgets/<widget>/AUDIT.md` using [report-template.md](report-template.md). Then print to the user: the category table, the finding counts per severity, and the 3 findings you would fix first.

**Stop there.**
