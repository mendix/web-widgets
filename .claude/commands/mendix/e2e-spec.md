You are helping the developer write or improve Playwright e2e specs for a Mendix pluggable widget in the web-widgets monorepo.

**Read first**: `docs/requirements/e2e-test-guidelines.md` — owns all rules for imports, assertions, locators, navigation, and snapshots. Do not duplicate them here.

## Context

- Specs live at: `packages/pluggableWidgets/<widget>/e2e/*.spec.js`
- Playwright strict mode is ON
- Full rules: `docs/requirements/e2e-test-guidelines.md`

## Discovering selectors and navigation from the test project

Before writing selectors, look up the actual widget names and menu labels in the `.mpr`:

```bash
# Full overview: modules, pages, entities, navigation menu labels
bash automation/mxcli/mx-testproject.sh inspect <widget>

# Widget structure of a specific page (reveals .mx-name-* values)
bash automation/mxcli/mx-testproject.sh exec <widget> "DESCRIBE PAGE <Module>.<PageName>"

# List pages if you don't know the page name
bash automation/mxcli/mx-testproject.sh list-pages <widget>

# Search for a widget name across all project strings
bash automation/mxcli/mx-testproject.sh search <widget> "<keyword>"
```

The `inspect` output includes `DESCRIBE NAVIGATION Responsive` at the end — use those exact strings in `page.getByRole("menuitem", { name: "..." })`.

## Spec file split

Standard naming convention per widget:

- `<widget>.spec.js` — core rendering and data binding
- `onClick.spec.js` — microflow, nanoflow, keyboard accessibility
- `dataTypes.spec.js` — each supported Mendix attribute type
- `layouts.spec.js` — widget inside list view, tab, data view, listen-to-grid

## Running tests

```bash
# Full CI run (Docker):
pnpm --filter @mendix/<widget> run e2e

# Skip re-downloading the test project:
pnpm --filter @mendix/<widget> run e2e --no-setup-project

# Skip re-downloading and rebuilding:
pnpm --filter @mendix/<widget> run e2e --no-setup-project --no-update-project
```

⚠️ Pass flags directly — do NOT use `pnpm run e2e -- --no-setup-project`. The `--` separator causes yargs-parser to ignore the flags.

## Checklist

- [ ] Import from `@mendix/run-e2e/fixtures` — NOT `@playwright/test`
- [ ] No manual `afterEach` logout — fixture handles it
- [ ] No `waitForLoadState("networkidle")` — prohibited, see guidelines
- [ ] No locator matches multiple elements without `.first()` or a compound selector
- [ ] No assertions on Atlas design classes
- [ ] All tests pass in CI (`pnpm run e2e`)
