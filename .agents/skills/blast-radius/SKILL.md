---
name: blast-radius
description: Find what a change in the web-widgets monorepo could break outside its own diff, such as consuming widgets, Mendix apps already using the widget, custom themes, and modules that bundle it. Then prove the facts it is safe because of by running code against both the change and its base. Use for "blast radius of X", "what could this break", before changing a shared package or a widget XML, or when reviewing a small diff you don't trust.
---

# Blast radius

Find what a change breaks somewhere else before it ships.

Listing callers is not the job, because grep does that in seconds. The job is the breakage grep won't show you. In this repo that breakage is usually in a Mendix app you can't see, such as a page configured against the old XML, a custom theme styling an old class name, a screen reader or touch device sending different events, or a module that bundles the widget.

## Don't trust your own writeup

A writeup that sounds right is worthless, because it sounds the same whether or not it is true. Find the one or two facts the change's safety depends on, and prove them by running code.

For each fact, get as far down this list as is cheap, and say where it stopped:

1. **Said so.** Worthless on its own.
2. **Pointed at it.** A real `file:line`, the platform typings, or the line in the library's source under `node_modules`.
3. **Walked it.** You traced the bad case step by step and it can't happen.
4. **Ran it.** A spec or script calls the real code. It fails on the base and passes on the change, or the reverse for a regression.
5. **Reproduced it in the running app.** A Playwright e2e run, or the widget in a Mendix test project (see the `debug-widget` skill).

A proof that passes on both the base and the change proves nothing. Always run it against both.

## Steps

### 1. Read the change

Review the whole PR range, never a single commit. Use `git diff $(git merge-base origin/main HEAD)...HEAD`, or `gh pr diff <n>` for a PR. Features often land over several commits, and a single commit can look broken or safe in ways the full range is not.

Read the symbols the change adds, changes, and deletes. Work out what the code now does differently, including what the diff doesn't spell out:

- a changed default
- a different render or event order
- a value now read before its status is checked
- a group of handlers that holds more than the one the PR is about

Read the PR description, the changelog entries, and any OpenSpec scenarios as claims to check against the code, not as facts.

### 2. Find the facts it's safe because of

Most changes that look risky are safe because of one or two facts. Examples:

- "Every consumer still compiles against the new signature."
- "The new XML property is optional and its default reproduces the old behavior."
- "This class is only set and read inside the component. No theme file or design property targets it."
- "The skipped call was a no-op on the platform side." Check the Mendix typings: `node_modules/mendix/index.d.ts` as resolved from the package.

Find those facts. If they hold, most of the risky cases are cleared at once. Spend your time here, not on a long list of maybes.

### 3. Look where grep stops

Check each surface the change touches. Skim and skip the ones it doesn't.

**Workspace consumers.** List the packages that depend on the changed one, transitive dependents included:

```sh
pnpm -r --filter "...^@mendix/<package>" exec pwd
```

Then narrow the list to the packages that actually use the changed symbol, with grep. Often only two of six dependents matter. Shared packages resolve through `dist/`, so consumers see a change only after a build. A type change can pass the shared package's own `tsc` and still break a consumer.

**The XML contract with existing apps.** Apps store their configuration against `src/<Widget>.xml`. Check whether any of these changed:

- property keys
- enumeration values
- `required`
- `defaultValue`
- property type
- `isList` or `dataSource` links
- the widget `id`

Also confirm the generated `typings/<Widget>Props.d.ts`, `src/<Widget>.editorConfig.ts`, and `src/<Widget>.editorPreview.tsx` still agree with the XML.

**Mendix value states and prop identity.**

- Check `Loading`, `Unavailable`, a read-only `EditableValue`, an empty `ListValue`, and an `ActionValue` with `canExecute === false`.
- The runtime sends new value objects through `setProps` on every update. Anything that tracks `gate.props` re-runs on each new props object.
- `gate.props` is a snapshot until the next render. Within one action, a value read after a `setLimit` or `setValue` call is still the old one.

**Two-way attribute sync.** This is a common source of bugs here: an inbound reaction (attribute to internal state) paired with an outbound autorun (internal state to attribute). Check that:

- the outbound write doesn't revert a value the app just set
- a preset attribute survives setup
- placeholder values, such as `-1` for "not computed yet", are never written to the attribute
- the inbound and outbound writes don't keep triggering each other

**Input, browsers and assistive tech.** For changes to event handling, check:

- the keyboard (Enter and Space, `keyup` bubbling from inner controls)
- touch (taps, double tap)
- screen readers and programmatic `.click()`, which send `detail === 0`
- event `timeStamp` and `detail` differences between Chromium, Firefox and Safari
- slow handlers under load

**Styling that you can't see.** App developers style widgets by class name in their own themes, and Atlas design properties toggle classes. Before you rename or remove a class or change DOM structure, search for it in:

- the widget's own SCSS
- `packages/modules/*/src/themesource/**`, the module themes and `design-properties.json`
- e2e selectors in `e2e/*.spec.js`

**Modules that bundle the widget.** For example, `packages/modules/data-widgets` ships datagrid, gallery, the filters, and others. A widget change ships in the module too, and needs a changelog entry in each affected widget. The module's `marketplace.minimumMXVersion` caps which Mendix APIs the widget can use.

**Timing.** Check:

- MobX reactions (`fireImmediately`, `delay`, disposal through `disposeBatch`)
- React 18 effect order and cleanup
- what happens on unmount while a request is in flight
- rapid repeated input
- datasource reloads that replace every item

**Pinned and patched libraries.** Read the version you actually ship. The root `package.json` pins versions through `pnpm.overrides` and patches others through `pnpm.patchedDependencies`, with the patch files in `patches/`.

### 4. Rate each risk honestly

Give each risk a real likelihood and a real cost. Keep the risks you confirmed. List the ones you checked and cleared separately. Cite a real `file:line`. A search that finds nothing is still an answer, so show the command. Never make up a caller or an API. If the PR's description, changelog, or spec claims something the code doesn't do, report that too.

### 5. Prove the facts

Write a spec or script that runs the real code, run it against the change and the base, and paste the relevant lines of output.

**Set up.** On a fresh install, run `pnpm install`, then `pnpm turbo build` in the package before its tests. Shared dependencies resolve through `dist/`.

**Run against the base.** Swap in the base version of the file, rebuild if consumers need to see it, rerun, then restore:

```sh
git show <base>:<path> > <path>
pnpm run test -t "<probe>"
git checkout -- <path>
```

**Choose a lever.**

- **A focused Jest spec in the affected package.** Use the `@mendix/widget-plugin-test-utils` builders by default. When identity matters, build a value that behaves like the runtime: a new object delivered through the real `GateProvider` and `setProps`. The builders' `EditableValue.setValue` mutates in place, and a test with a static `{ props }` object can't catch reactivity bugs.
- **The shared package plus every consumer's tests:**

    ```sh
    pnpm turbo test --continue --filter="...@mendix/<package>"
    ```

    Without `^`, the filter includes the package itself. `--continue` shows every failure, not just the first. Check each package's `Tests:` line in the log, not just `Tasks: N successful`, because a package whose `test` script runs nothing still reports success. To expose timing flakes, run it several times; the parallel load can show failures that a single-package run hides.

- **Type-checking the consumers:** `pnpm turbo build --continue --filter=<consumer> ...`, for the consumers that use the symbol.
- **A raw Playwright script for browser facts.** Use `page.setContent(...)` with the real event wiring, for things like event timestamps, `detail` values, or label forwarding. It takes about a second and needs no Mendix project. Playwright is at `node_modules/.bin/playwright`. Only Chromium is installed locally, so mark Firefox and Safari facts **unproven**.
- **An e2e spec or a manual run in a Mendix test project**, for anything that depends on the Mendix runtime or Studio Pro.

**Clean up.** A throwaway spec under `src/` must type-check, because `turbo build` runs `tsc` and Jest does not. Otherwise keep it outside `src/` while turbo runs. Expect the post-edit lint hook to complain about it. Delete throwaway files afterward, and revert side effects such as regenerated typings or changed file modes. Only commit a spec that tests behavior users can observe (see "Testing" in `AGENTS.md`).

## What to hand back

Keep it short. Paste only the output lines that prove something.

- **What it does.** What changed, including the non-obvious part.
- **The facts it's safe because of.** State each fact and the step you got it to, with the proof. If you couldn't prove a fact, write **unproven** and say what would prove it.
- **Risks.** For each one: how it breaks, `file:line`, likelihood, cost, and how to check. Flag a breaking change for Mendix apps as such. It needs a changelog entry that says so and a migration path. Include wrong claims in the PR description, changelog, or spec.
- **Cleared.** What you checked and why it's fine, including searches that found nothing.
- **Before you merge.** The cheapest test or repro that would catch the real bug, including any spec you wrote.

The **Blast radius** section of the PR body (`.github/pull_request_template.md`) is the short form of this report.
