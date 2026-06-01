You are orchestrating the full e2e development workflow for a Mendix pluggable widget in the web-widgets monorepo. This command chains together test-project inspection/editing (mxcli), spec writing, widget build, and Playwright validation.

## Arguments

Widget name passed by user: $ARGUMENTS

If no widget name is provided, ask the user which widget they are working on (e.g., `badge-web`, `datagrid-web`).

## Prerequisites

- `automation/tools/mxcli` must exist. If missing, run: `bash automation/mxcli/setup.sh`
  (The setup script now installs v0.11.0 and auto-detects OS/arch. It will self-heal if you call any `mx-testproject.sh` subcommand and the binary is absent.)
- The `.mpr` test project must be **closed in Studio Pro** before any mxcli edits
- Docker must be running for the full CI e2e run

---

## Phase 1 — Inspect the test project

Use the helper script to get a full overview in one call — it shows modules, pages, entities, **and** the navigation menu:

```bash
bash automation/mxcli/mx-testproject.sh inspect <widget>
```

The `inspect` subcommand now automatically runs `DESCRIBE NAVIGATION Responsive` at the end, giving you the exact menu labels needed for Playwright selectors.

If you need more detail on a specific page's widget structure:

```bash
bash automation/mxcli/mx-testproject.sh exec <widget> "DESCRIBE PAGE <Module>.<PageName>"
```

If you need to search for a widget name or string across all project files:

```bash
bash automation/mxcli/mx-testproject.sh search <widget> "<keyword>"
```

**Output of this phase**: A clear map of modules, pages, navigation menu labels, and existing widget names (`.mx-name-*` values).

---

## Phase 1b — Lint the test project (recommended before edits)

Before making any changes, capture the baseline lint state so you know which issues you own:

```bash
bash automation/mxcli/mx-testproject.sh lint <widget>
```

This runs all 41 built-in mxcli rules. Any pre-existing violations are not your responsibility — note them and move on. Re-run after edits to confirm you introduced no new ones.

---

## Phase 2 — Edit the test project (only if needed)

Only run mxcli edits if a new page or entity is required for the new test scenario. Reference `mendix:edit-test-project` for full MDL guidance.

**Critical rules** (repeated here for safety):

- **Never** use `CREATE OR MODIFY PAGE Module.ExistingPage {}` — the empty body wipes all widget content
- Always include `Layout: Atlas_Core.Atlas_Default` in `CREATE PAGE`
- Always call `GRANT VIEW ON PAGE Module.Page TO Module.Role` after creating a new page
- Confirm with the user before making any `.mpr` changes

**Recommended safety flow before applying any MDL**:

1. Write your MDL to a temp file (e.g., `changes.mdl`)
2. Validate syntax and references:
    ```bash
    bash automation/mxcli/mx-testproject.sh check <widget> changes.mdl
    ```
3. Preview the diff before applying:
    ```bash
    bash automation/mxcli/mx-testproject.sh diff <widget> changes.mdl
    ```
4. If the diff looks correct, apply:
    ```bash
    bash automation/mxcli/mx-testproject.sh exec <widget> "$(cat changes.mdl)"
    ```

After edits, remind the user to reopen Studio Pro and click **Synchronize App Directory** (or reload when prompted).

---

## Phase 3 — Write or update the Playwright spec

Follow all rules from `mendix:e2e-spec`. Key checklist:

- `test.afterEach` with `window.mx.session.logout()` in every file
- Use `.mx-name-<widgetName>` selectors (not structural selectors)
- No assertions on Atlas design classes
- Retrying assertions for async state (`toHaveText`, `toBeVisible`)
- `waitForLoadState("networkidle")` after every menu-based navigation
- Use `navigateViaMenu` pattern (not direct URL) for existing pages
- Strict mode: add `.first()` or compound selectors when a locator matches multiple elements

Spec files live at: `packages/pluggableWidgets/<widget>/e2e/*.spec.js`

Standard file split:

- `<widget>.spec.js` — core rendering and data binding
- `onClick.spec.js` — microflow, nanoflow, keyboard
- `dataTypes.spec.js` — attribute types
- `layouts.spec.js` — list view, tab, data view, listen-to-grid

---

## Phase 4 — Build the widget MPK

```bash
pnpm --filter @mendix/<widget> run release
```

Wait for the build to complete without errors before proceeding.

---

## Phase 5 — Run the e2e suite

```bash
# Full CI run (Docker — downloads project, builds, runs all specs):
pnpm --filter @mendix/<widget> run e2e

# Skip re-downloading the test project if already present locally:
pnpm --filter @mendix/<widget> run e2e --no-setup-project

# Skip both download and rebuild (fastest iteration):
pnpm --filter @mendix/<widget> run e2e --no-setup-project --no-update-project
```

⚠️ Pass flags directly — do NOT use `pnpm run e2e -- --no-setup-project`. The `--` separator causes yargs-parser to ignore the flags.

If any tests fail, read the Playwright output carefully:

- Strict-mode errors → add `.first()` or a compound selector
- Session-limit errors → ensure `test.afterEach` logout is present
- Timeout errors → add `waitForLoadState("networkidle")` or increase timeout

---

## Phase 6 — Visual validation with Playwright MCP

After the suite passes, use the Playwright MCP browser tools to do a live smoke check:

1. Navigate to the running Mendix app (default: `http://localhost:3001`)
2. Log in if prompted (default credentials: `MxAdmin` / `1`)
3. Navigate to the page under test via the menu
4. Take a screenshot and inspect the snapshot to confirm the widget renders correctly
5. Click interactive elements and verify expected behavior (dialogs, text updates)

```
Tools to use:
- mcp__plugin_playwright_playwright__browser_navigate
- mcp__plugin_playwright_playwright__browser_snapshot
- mcp__plugin_playwright_playwright__browser_take_screenshot
- mcp__plugin_playwright_playwright__browser_click
- mcp__plugin_playwright_playwright__browser_type
- mcp__plugin_playwright_playwright__browser_fill_form
- mcp__plugin_playwright_playwright__browser_wait_for
- mcp__plugin_playwright_playwright__browser_close
```

---

## Done checklist

- [ ] All existing tests still pass (no regressions)
- [ ] New tests pass in isolation and in the full suite
- [ ] Visual snapshot updated if needed (`--update-snapshots`)
- [ ] `.mpr` changes committed if any were made
- [ ] New spec files follow the `test.afterEach` logout pattern
- [ ] Lint re-run after MPR edits confirms no new violations
