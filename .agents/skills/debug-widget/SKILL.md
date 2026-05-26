---
name: debug-widget
description: Use when debugging a Mendix pluggable widget bug — visual glitch, broken scrolling, missing data, stale state, or interaction bugs that need runtime evidence before fixing.
---

# Debug Widget

## Overview

Evidence-first debugging for Mendix pluggable widgets. You MUST reproduce the bug with Playwright before reading source code, and MUST verify the fix with Playwright before declaring success.

**REQUIRED BACKGROUND:** `superpowers:systematic-debugging` for general root-cause methodology.

## Prerequisites

Before starting, confirm with the user:

1. **Test project running?** The Mendix app must be live at `http://localhost:8080`. Ask: "Is the Studio Pro project running?"
2. **MX_PROJECT_PATH set?** Needed for deploying the built widget. Ask if not provided.
3. **JIRA/bug description?** Extract: widget package, symptom, reproduction steps.

## Workflow

### Phase 1: Reproduce

1. **Identify the target** from the bug report:
    - Widget package (`combobox-web`, `datagrid-web`, …)
    - Symptom type — see Bug Categories table below
    - Reproduction steps from JIRA

2. **Find the page** — see [page-discovery.md](page-discovery.md)

3. **Write a diagnostic Playwright script** that follows the JIRA reproduction steps and captures the symptom as a measurable assertion or console output diff.

    See [diagnostic-patterns.md](diagnostic-patterns.md) for templates by bug category.

    Save it as: `packages/pluggableWidgets/<widget>-web/e2e/<bug-id>-diagnostic.spec.js`

4. **Run it:**

    ```bash
    cd packages/pluggableWidgets/<widget>-web
    npx playwright test e2e/<bug-id>-diagnostic.spec.js --headed
    ```

5. **Confirm reproduction:**
    - Script shows wrong values / assertion fails → **proceed to Phase 2**
    - Script does NOT demonstrate the bug → fix the script (selectors, timing, page URL). Do NOT proceed to Phase 2 until the script confirms the symptom.

### Phase 2: Analyze + Fix

Now you may read source code.

1. **Trace the reactive chain** from DOM symptom to root cause.
   See [reactive-chain.md](reactive-chain.md).
    - Simple widgets (combobox, badge): React props → hooks → component render
    - Complex widgets (datagrid, gallery): React props → Gate → MobX stores → Observer components

2. **Find root cause** using `superpowers:systematic-debugging` Phase 1–3:
    - Read error messages and trace data flow
    - Form a single hypothesis, test minimally
    - Do NOT attempt a fix without understanding WHY

3. **Apply the fix** at the root cause, not the symptom.

### Phase 3: Build + Deploy

1. **Bump the version** (patch for bugfixes, minor for new behavior). Two files must stay in sync:
    - `packages/pluggableWidgets/<widget>-web/package.json` — `"version"` field
    - `packages/pluggableWidgets/<widget>-web/src/package.xml` — `version=` attribute on `<clientModule>`

2. **Add a changelog entry** in `packages/pluggableWidgets/<widget>-web/CHANGELOG.md` under the existing `## [Unreleased]` section:

    ```markdown
    ### Fixed

    - We fixed an issue where <brief description of the bug>.
    ```

3. **Ensure `MX_PROJECT_PATH` is set** to the Studio Pro project directory (ask the user if not already set).

4. **Build and deploy the widget:**

    ```bash
    export MX_PROJECT_PATH=/Users/<user>/Mendix/<ProjectName>
    pnpm --filter @mendix/<widget>-web run build
    ```

    The build copies the `.mpk` directly into `$MX_PROJECT_PATH/widgets/`. If shared packages were modified, build them first — check the widget's `AGENTS.md` for the dependency list.

5. Once the build succeeds, proceed directly to Phase 4 — no manual browser refresh or Studio Pro action needed.

### Phase 4: Verify (GATE — must pass before declaring success)

**You CANNOT claim the fix works until the Playwright script confirms it.**

1. **Re-run the same diagnostic script** from Phase 1:

    ```bash
    cd packages/pluggableWidgets/<widget>-web
    npx playwright test e2e/<bug-id>-diagnostic.spec.js --headed
    ```

    Playwright's `page.goto("http://localhost:8080/...")` navigates fresh and picks up the latest deployed widget automatically — no manual browser refresh needed.

2. **Evaluate result:**
    - Assertion passes / console output shows correct values → **fix confirmed**
    - Still failing → **return to Phase 2**. Do NOT guess another fix. Log what changed, what was expected, what happened. If this is the 3rd failed attempt, question the architecture per `superpowers:systematic-debugging` Phase 4.5.

3. **After confirmed fix:**
    - Run unit tests: `cd packages/pluggableWidgets/<widget>-web && pnpm run test`
    - Convert the diagnostic script into a regression test (change `console.log` to `expect()` assertions), or delete it
    - Report findings to user

## Build-Verify Loop

```
Phase 2 (fix) → Phase 3 (build + deploy) → Phase 4 (verify)
                                                │
                                      passes? ──┤
                                      yes: done │
                                      no: ──────→ back to Phase 2
                                                (max 3 attempts, then question architecture)
```

## Bug Categories

| Category    | Symptom Signals                               | Diagnostic Pattern                              |
| ----------- | --------------------------------------------- | ----------------------------------------------- |
| Layout/CSS  | Wrong size, overflow broken, misaligned       | Dimensions, CSS custom properties, `max-height` |
| Data        | Missing rows, wrong values, stale content     | Row count, datasource status, item text         |
| Stale State | Value not updating, external change ignored   | Read display → trigger change → read again      |
| Interaction | Click/keyboard unresponsive, wrong selection  | Event handling, `aria-selected`, MobX actions   |
| Performance | Janky scroll, slow render, high rerender rate | Frame timing, render count, DOM node count      |
| Lifecycle   | Flash of old content, double render           | Gate prop timing, MobX reaction order           |

## Common Mistakes

- **Skip Playwright reproduction** — if you didn't reproduce it, you don't understand it. No exceptions.
- **Fix the symptom, not the cause** — masking at the consumer layer won't hold. Trace to root.
- **Skip session cleanup** — always call `window.mx.session.logout()` after each test. Mendix caps at 5 concurrent sessions.
- **Forget to rebuild shared packages** — if `widget-plugin-grid` or other workspace deps changed, build them first.
- **Wrong page config** — the widget appears on multiple pages. Match the config to the bug scenario.
- **Forget to deploy .mpk** — building alone doesn't deploy. Copy the `.mpk` to `$MX_PROJECT_PATH/widgets/`.

## Extending This Skill

This skill applies to **all** pluggable widgets and grows with each debugging session. After fixing a bug, consider adding:

| What to add                           | Where                                                                  | When                                                                                      |
| ------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| New bug category / diagnostic pattern | `diagnostic-patterns.md`                                               | You encountered a symptom type not yet covered                                            |
| Widget-specific selectors             | `diagnostic-patterns.md` (under the relevant pattern's selector table) | You debugged a widget and know its key CSS selectors                                      |
| Widget architecture section           | `reactive-chain.md`                                                    | The widget uses DI/MobX and isn't documented there yet                                    |
| New page discovery method             | `page-discovery.md`                                                    | Existing tiers didn't work for a specific project setup                                   |
| Widget context file                   | `packages/pluggableWidgets/<widget>-web/AGENTS.md`                     | The widget has no AGENTS.md — create one to document its architecture for future sessions |

**Keep patterns widget-agnostic.** Use `<placeholder>` selectors in templates. Add widget-specific selector tables below each pattern so the next developer can reuse your selectors without re-discovering them.

## Reference Files

| File                                             | Contents                                         |
| ------------------------------------------------ | ------------------------------------------------ |
| [page-discovery.md](page-discovery.md)           | Tier 0/1/2/3 page discovery procedures with code |
| [reactive-chain.md](reactive-chain.md)           | Architecture tiers, tracing procedure, key files |
| [diagnostic-patterns.md](diagnostic-patterns.md) | Playwright script templates by bug category      |
