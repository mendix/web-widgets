You are orchestrating the full e2e development workflow for a Mendix pluggable widget in the web-widgets monorepo.

Widget name passed by user: $ARGUMENTS

If no widget name is provided, ask the user which widget they are working on (e.g., `badge-web`, `datagrid-web`).

## Prerequisites

- `automation/tools/mxcli` must exist. If missing, run: `bash automation/mxcli/setup.sh`
- The `.mpr` test project must be **closed in Studio Pro** before any mxcli edits. Check with:
    ```bash
    ls packages/pluggableWidgets/<widget>/tests/testProject/.mendix-cache/lock 2>/dev/null \
      && echo "⚠️ Studio Pro lock file present — close the project first" \
      || echo "OK — no lock file"
    ```
- Docker must be running for the full CI e2e run

---

## Phase 1 — Download and inspect the test project

Download the test project (if not already present):

```bash
pnpm --filter @mendix/<widget> run e2edev --setup-project
```

If this fails with `404 Not Found` / `Cannot find test project in GitHub repository`, the branch does not exist yet in `mendix/testProjects`. In that case:

1. Copy an existing chart/widget MPR as a base (e.g. from `column-chart-web/tests/testProject/`).
2. Place it at `packages/pluggableWidgets/<widget>/tests/testProject/<WidgetName>.mpr`.
3. Copy the `widgets/`, `deployment/`, `theme/`, and `themesource/` folders from the same source.
4. Replace the source widget's `.mpk` in `widgets/` with the new widget's built `.mpk` (run `pnpm --filter @mendix/<widget> run release` first).
5. Adapt the domain model and microflows via mxcli (see `mendix:edit-test-project`).
6. After Studio Pro has opened the MPR and registered the new widget type, push a new branch `<widget>` to `mendix/testProjects` so CI can download it.

Then inspect:

```bash
bash automation/mxcli/mx-testproject.sh inspect <widget>
```

This shows modules, pages, entities, and navigation menu labels in one call. For a specific page's widget structure:

```bash
bash automation/mxcli/mx-testproject.sh exec <widget> "DESCRIBE PAGE <Module>.<PageName>"
```

> **Note**: `DESCRIBE PAGE` may show an empty body for pages that only contain pluggable widgets. Use `automation/tools/mxcli bson dump -p <MPR> --type page --object <Module>.<Page>` and grep for widget names to verify content. See `mendix:edit-test-project` for details.

**Output**: map of modules, pages, navigation labels, and `.mx-name-*` widget names.

---

## Phase 1b — Baseline lint (recommended before edits)

```bash
bash automation/mxcli/mx-testproject.sh lint <widget>
```

Note any pre-existing violations — re-run after edits to confirm you introduced none.

---

## Phase 2 — Edit the test project (only if needed)

Only needed when a new page or entity is required. See `mendix:edit-test-project` for full MDL guidance and the validate → diff → apply safety flow.

Key rules:

- **Never** use `CREATE OR MODIFY PAGE Module.ExistingPage {}` — wipes all widget content
- Always include `Layout: Atlas_Core.Atlas_Default` in `CREATE PAGE`
- Always `GRANT VIEW ON PAGE` after creating a page
- Confirm with the user before any `.mpr` changes

After edits: remind the user to reopen Studio Pro and click **Synchronize App Directory**.

---

## Phase 3 — Write or update the Playwright spec

Follow `mendix:e2e-spec` for selector discovery via mxcli and spec file naming. Follow `docs/requirements/e2e-test-guidelines.md` for all Playwright rules (imports, assertions, navigation, snapshots).

Spec files live at: `packages/pluggableWidgets/<widget>/e2e/*.spec.js`

---

## Phase 4 — Build the widget MPK

```bash
pnpm --filter @mendix/<widget> run release
```

---

## Phase 5 — Run the e2e suite

```bash
# Full CI run (Docker):
pnpm --filter @mendix/<widget> run e2e

# Skip re-downloading the test project:
pnpm --filter @mendix/<widget> run e2e --no-setup-project

# Skip re-downloading and rebuilding:
pnpm --filter @mendix/<widget> run e2e --no-setup-project --no-update-project
```

⚠️ Pass flags directly — do NOT use `pnpm run e2e -- --no-setup-project`. The `--` separator causes yargs-parser to ignore the flags.

If tests fail:

- Strict-mode errors → add `.first()` or a compound selector
- Session errors → confirm import is from `@mendix/run-e2e/fixtures`
- Timeout errors → use `waitForMendixApp(page)` or `waitForDataReady(page)` from `@mendix/run-e2e/mendix-helpers`

---

## Phase 6 — Visual validation with Playwright MCP

After the suite passes, do a live smoke check against the running app (`http://localhost:3001`, credentials `MxAdmin` / `1`):

```
mcp__plugin_playwright_playwright__browser_navigate
mcp__plugin_playwright_playwright__browser_snapshot
mcp__plugin_playwright_playwright__browser_take_screenshot
mcp__plugin_playwright_playwright__browser_click
mcp__plugin_playwright_playwright__browser_type
mcp__plugin_playwright_playwright__browser_fill_form
mcp__plugin_playwright_playwright__browser_wait_for
mcp__plugin_playwright_playwright__browser_close
```

---

## Done checklist

- [ ] All existing tests still pass (no regressions)
- [ ] New tests pass in CI
- [ ] Visual snapshot updated if needed (`--update-snapshots`)
- [ ] `.mpr` changes committed if any were made
- [ ] Lint re-run after MPR edits confirms no new violations
