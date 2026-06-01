You are helping the developer edit a Mendix test project (.mpr file) to support a new or updated Playwright e2e test in the web-widgets monorepo.

## Context

- Test projects live at: `packages/pluggableWidgets/<widget>/tests/testProject/<Name>.mpr`
- E2e specs live at: `packages/pluggableWidgets/<widget>/e2e/*.spec.js`
- `mxcli` is the CLI tool for reading/writing .mpr files via MDL (Mendix Definition Language)
- Binary: `automation/tools/mxcli` (install via `bash automation/mxcli/setup.sh` if missing)
- The .mpr file **must be closed in Studio Pro** before mxcli can edit it
- mxcli is **alpha software** — always ensure `.mendix-cache/backup/AppBackup.mpr` exists before bulk edits

## Your task

Follow these steps:

### Step 1 — Identify the widget and goal

Ask the user (or infer from context):

- Which widget are they working on? (e.g., `badge-web`)
- What e2e test or scenario needs a test project change?

Refer to `mendix:e2e-spec` for the full selector and navigation rules your page changes need to satisfy before writing new Playwright tests.

### Step 2 — Check prerequisites

1. Verify mxcli is installed and executable:

    ```bash
    [[ -x automation/tools/mxcli ]] && echo "OK" || bash automation/mxcli/setup.sh
    ```

2. Resolve the .mpr file path:

    ```bash
    ls packages/pluggableWidgets/<widget>/tests/testProject/*.mpr | grep -v backup
    ```

3. Remind the user: **close the project in Studio Pro before continuing**, otherwise mxcli will conflict with Studio Pro's in-memory cache.

### Step 3 — Inspect the current test project state

Run the inspect subcommand for a full overview — it shows modules, pages, entities, and navigation in one call:

```bash
bash automation/mxcli/mx-testproject.sh inspect <widget>
```

The navigation section at the end gives the exact menu labels for Playwright's `page.getByRole("menuitem", { name: "..." })`.

For more targeted queries:

```bash
# List pages in a specific module:
automation/tools/mxcli -p <MPR_PATH> -c "SHOW PAGES IN <Module>"

# List entities:
automation/tools/mxcli -p <MPR_PATH> -c "SHOW ENTITIES IN <Module>"

# List roles (needed before GRANT VIEW):
automation/tools/mxcli -p <MPR_PATH> -c "SHOW ROLES IN <Module>"

# List nanoflows:
automation/tools/mxcli -p <MPR_PATH> -c "SHOW NANOFLOWS IN <Module>"

# Inspect an existing page's widget structure:
automation/tools/mxcli -p <MPR_PATH> -c "DESCRIBE PAGE <Module>.<PageName>"

# Search for a widget name or string across the whole project:
bash automation/mxcli/mx-testproject.sh search <widget> "<keyword>"
```

### Step 3b — Run a baseline lint check

Before making any edits, capture the project's current health so you know which issues you own:

```bash
bash automation/mxcli/mx-testproject.sh lint <widget>
```

Re-run lint after your edits to confirm no new violations were introduced.

### Step 4 — Plan and execute MDL changes

#### ⚠️ CRITICAL: `CREATE OR MODIFY PAGE ... {}` wipes page content

**Never use `CREATE OR MODIFY PAGE Module.ExistingPage {}` on a page that already has widgets.** The empty body `{}` replaces all widgets with nothing — the page becomes an empty shell and Mendix runtime redirects away from it. This cannot be undone without restoring from backup.

Safe approach:

- Use `CREATE PAGE` only for **new** pages (not existing ones)
- To add a URL slug or change page metadata, **open Studio Pro** — mxcli cannot patch metadata without replacing content
- After a destructive edit, restore from `tests/testProject/.mendix-cache/backup/AppBackup.mpr`

#### Recommended safety flow: validate → diff → apply

Before executing any MDL that modifies the project, write it to a file and validate first:

```bash
# 1. Validate MDL syntax and check that all references resolve:
bash automation/mxcli/mx-testproject.sh check <widget> changes.mdl

# 2. Preview the changes as a diff (no writes):
bash automation/mxcli/mx-testproject.sh diff <widget> changes.mdl

# 3. If the diff looks correct, apply:
bash automation/mxcli/mx-testproject.sh exec <widget> "$(cat changes.mdl)"
```

This is especially important for destructive operations — the diff step makes the impact visible before anything is written.

#### Creating a new page

```
CREATE PAGE Module.PageName (
  Title: 'Page Title',
  Layout: Atlas_Core.Atlas_Default
)
```

**Always include `Layout: Atlas_Core.Atlas_Default`** — omitting it sets the layout to `dummyModule.dummyName` and mxbuild fails with exit code 3.

After creating the page, grant access to at least one role or mxbuild fails:

```bash
automation/tools/mxcli -p <MPR_PATH> -c "GRANT VIEW ON PAGE <Module>.<PageName> TO <Module>.<RoleName>"
```

Check existing roles with:

```bash
automation/tools/mxcli -p <MPR_PATH> -c "SHOW ROLES IN <Module>"
```

#### Navigating to new pages from Playwright

**Do not use `page.goto("/p/<page-name>")` for pages with existing widget content** — URL slugs require a metadata-only update that mxcli cannot safely perform.

Instead, prefer **navigation menu traversal** — no mxcli changes needed:

```js
async function navigateViaMenu(page, menuLabel, itemLabel) {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("menuitem", { name: menuLabel }).click();
    await page.getByRole("menuitem", { name: itemLabel }).click();
    await page.waitForLoadState("networkidle");
}
// Example:
// await navigateViaMenu(page, "Different Views", "Listen To Grid");
```

The exact `menuLabel` and `itemLabel` values come from `DESCRIBE NAVIGATION Responsive` (included in `inspect` output).

For **brand-new pages** (created by mxcli with empty content), URL navigation works fine:

```js
await page.goto("/p/my-new-page");
```

### Step 5 — Rebuild and run

After the .mpr is updated:

```bash
# Rebuild the widget MPK
pnpm --filter @mendix/<widget> run release

# Run full CI e2e (Docker — downloads project, builds, runs Playwright)
pnpm --filter @mendix/<widget> run e2e

# Skip re-downloading the test project (already have it locally):
pnpm --filter @mendix/<widget> run e2e --no-setup-project

# Also skip rebuilding the widget MPK (already built):
pnpm --filter @mendix/<widget> run e2e --no-setup-project --no-update-project
```

⚠️ **Pass flags directly to `pnpm run e2e`** — do NOT use `pnpm run e2e -- --no-setup-project`. The `--` separator causes yargs-parser to treat the flags as positional args and ignores them, so the test project gets re-downloaded anyway.

### Step 6 — Verify

**Option A — Run via Docker CI** (recommended for final validation):

```bash
pnpm --filter @mendix/<widget> run e2e
```

**Option B — Verify in Studio Pro**:

1. Open the `.mpr` in Studio Pro
2. Click "Synchronize App Directory"
3. Run the app locally
4. Navigate to the new page to confirm it renders

## MDL Quick Reference

| Goal                       | MDL / Command                                                                 |
| -------------------------- | ----------------------------------------------------------------------------- |
| List modules               | `SHOW MODULES`                                                                |
| List pages                 | `SHOW PAGES IN Module`                                                        |
| List entities              | `SHOW ENTITIES IN Module`                                                     |
| List roles                 | `SHOW ROLES IN Module`                                                        |
| List nanoflows             | `SHOW NANOFLOWS IN Module`                                                    |
| Describe page widgets      | `DESCRIBE PAGE Module.PageName`                                               |
| Describe navigation menu   | `DESCRIBE NAVIGATION Responsive`                                              |
| Search project strings     | `SEARCH "keyword"`                                                            |
| Show callers of microflow  | `SHOW CALLERS OF Module.MicroflowName`                                        |
| Show callers (transitive)  | `SHOW CALLERS OF Module.MicroflowName TRANSITIVE`                             |
| Show references to element | `SHOW REFERENCES TO Module.ElementName`                                       |
| Show impact of element     | `SHOW IMPACT OF Module.ElementName`                                           |
| Show context for AI        | `SHOW CONTEXT OF Module.ElementName DEPTH 3`                                  |
| Create page                | `CREATE PAGE Module.Name (Title: 'Title', Layout: Atlas_Core.Atlas_Default)`  |
| Grant page access          | `GRANT VIEW ON PAGE Module.Page TO Module.Role`                               |
| Create entity              | `CREATE ENTITY Module.Name (Attr: String(200))`                               |
| Discover widgets by type   | `SHOW WIDGETS WHERE widgettype LIKE '%combobox%'`                             |
| Bulk-update widget props   | `UPDATE WIDGETS SET 'showLabel' = false WHERE widgettype LIKE '%X%' DRY RUN`  |
| Populate catalog tables    | `REFRESH CATALOG FULL`                                                        |
| Catalog SQL query          | `SELECT Name, ActivityCount FROM CATALOG.MICROFLOWS WHERE ActivityCount > 10` |
| Validate MDL syntax + refs | `mxcli check changes.mdl -p app.mpr --references`                             |
| Preview changes as diff    | `mxcli diff -p app.mpr changes.mdl`                                           |

## Important warnings

- **`CREATE OR MODIFY PAGE ... {}`** wipes all widget content — never use on pages that already have widgets
- mxcli is **alpha software** — ensure `.mendix-cache/backup/AppBackup.mpr` exists before bulk edits
- Do NOT run mxcli while Studio Pro has the project open
- After mxcli edits, Studio Pro shows "Project was modified externally" — click **Reload**
- New pages always need a `GRANT VIEW ON PAGE` call, otherwise mxbuild exits with code 3
- Always include `Layout: Atlas_Core.Atlas_Default` in `CREATE PAGE` — omitting it causes mxbuild to fail
- `automation/tools/mxcli` is gitignored — every developer must run `bash automation/mxcli/setup.sh` on first checkout
- Test project changes that affect widget configuration may require updating the `testProjects` repo branch for CI — flag this to the user
