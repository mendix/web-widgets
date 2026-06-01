You are helping the developer edit a Mendix test project (.mpr file) to support a new or updated Playwright e2e test in the web-widgets monorepo.

## Context

- Test projects live at: `packages/pluggableWidgets/<widget>/tests/testProject/<Name>.mpr`
- `mxcli` reads/writes `.mpr` files via MDL (Mendix Definition Language)
- Binary: `automation/tools/mxcli` — gitignored, install with `bash automation/mxcli/setup.sh`
- The `.mpr` **must be closed in Studio Pro** before mxcli can edit it
- mxcli is **alpha software** — ensure `.mendix-cache/backup/AppBackup.mpr` exists before bulk edits
- For Playwright rules that new pages must satisfy, see `mendix:e2e-spec` and `docs/requirements/e2e-test-guidelines.md`

---

## Step 1 — Identify widget and goal

Ask the user (or infer from context): which widget, and what scenario requires a test project change?

## Step 2 — Check prerequisites

```bash
[[ -x automation/tools/mxcli ]] && echo "OK" || bash automation/mxcli/setup.sh
ls packages/pluggableWidgets/<widget>/tests/testProject/*.mpr | grep -v backup
```

Remind the user to close the project in Studio Pro before continuing.

## Step 3 — Inspect current state

```bash
# Full overview: modules, pages, entities, navigation
bash automation/mxcli/mx-testproject.sh inspect <widget>

# Targeted queries:
automation/tools/mxcli -p <MPR_PATH> -c "SHOW PAGES IN <Module>"
automation/tools/mxcli -p <MPR_PATH> -c "SHOW ENTITIES IN <Module>"
automation/tools/mxcli -p <MPR_PATH> -c "SHOW ROLES IN <Module>"
automation/tools/mxcli -p <MPR_PATH> -c "SHOW NANOFLOWS IN <Module>"
automation/tools/mxcli -p <MPR_PATH> -c "DESCRIBE PAGE <Module>.<PageName>"
bash automation/mxcli/mx-testproject.sh search <widget> "<keyword>"
```

Run a baseline lint before editing:

```bash
bash automation/mxcli/mx-testproject.sh lint <widget>
```

## Step 4 — Plan and execute MDL changes

#### ⚠️ `CREATE OR MODIFY PAGE ... {}` wipes page content

Never use it on a page that already has widgets — the empty body replaces all content. Restore from `tests/testProject/.mendix-cache/backup/AppBackup.mpr` if this happens.

#### Safety flow: validate → diff → apply

```bash
# 1. Validate MDL syntax and references:
bash automation/mxcli/mx-testproject.sh check <widget> changes.mdl

# 2. Preview as a diff (no writes):
bash automation/mxcli/mx-testproject.sh diff <widget> changes.mdl

# 3. Apply:
bash automation/mxcli/mx-testproject.sh exec <widget> "$(cat changes.mdl)"
```

#### Creating a new page

```
CREATE PAGE Module.PageName (
  Title: 'Page Title',
  Layout: Atlas_Core.Atlas_Default
)
```

Always include `Layout: Atlas_Core.Atlas_Default` — omitting it causes mxbuild to fail with exit code 3.

After creating, grant page access or mxbuild fails:

```bash
automation/tools/mxcli -p <MPR_PATH> -c "GRANT VIEW ON PAGE <Module>.<PageName> TO <Module>.<RoleName>"
```

#### Navigating to pages from Playwright

For **existing pages** with widget content — use menu traversal (no mxcli changes needed). Get labels from `inspect` output:

```js
test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByRole("menuitem", { name: "Menu Label" }).click();
    await page.getByRole("menuitem", { name: "Page Label" }).click();
});
```

For **brand-new empty pages** created by mxcli, direct URL works:

```js
await page.goto("/p/my-new-page");
```

After edits: Studio Pro shows "Project was modified externally" — click **Reload**.

## Step 5 — Rebuild and validate

Continue with `mendix:e2e-workflow` from Phase 4 (build → run → validate).

---

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

## Warnings

- `CREATE OR MODIFY PAGE ... {}` wipes all widget content — never use on existing pages
- Do NOT run mxcli while Studio Pro has the project open
- New pages need `GRANT VIEW ON PAGE` — missing it causes mxbuild exit code 3
- `automation/tools/mxcli` is gitignored — run `bash automation/mxcli/setup.sh` on first checkout
- Test project changes may require updating the `testProjects` repo branch for CI — flag this to the user
