# GitHub Copilot – PR Review Instructions for Mendix Web Widgets

Use this guide to review both code and workflow. Focus on Mendix pluggable widget conventions, Atlas UI styling, React best practices, and our release process.

## Repo context

- **Monorepo** with packages under `packages/`:
    - `packages/pluggableWidgets/*-web`
    - `packages/modules/*`
    - `packages/customWidgets/*`
    - `packages/shared/*` (configs, plugins)
- **Stack**: TypeScript, React, SCSS, Rollup via `@mendix/pluggable-widgets-tools`, Jest/RTL, ESLint/Prettier.
- **Commands** (root): `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm -w changelog`, `pnpm -w version`.

## What to check on every PR

### PR metadata and process

- **Title format**:
    - If JIRA: `[XX-000]: description`
    - Else: conventional commits (e.g., `feat: ...`, `fix: ...`).
- **Template adherence** (see `.github/pull_request_template.md`):
    - Lint/test locally: `pnpm lint`, `pnpm test`.
    - New tests for features/bug fixes.
    - Related PRs linked if applicable.
    - If XML or behavior changes: ask for docs PR link in `mendix/docs`.
- **Multi-package PRs**: Validate each changed package separately.

### Versioning and changelog (per changed package)

- If runtime code, public API, XML schema, or behavior changes in a package:
    - **Require semver bump** in that package's `package.json`.
    - **Require `CHANGELOG.md` update** (Keep a Changelog, semver).
    - Suggest: `pnpm -w changelog` (or update manually).
- If refactor/docs/tests-only: bump not required (ask author to confirm).
- Multiple changed packages: each needs its own bump and changelog entry.

## Code quality – Mendix pluggable widgets and React

### Mendix-specific

- **XML ↔ TSX alignment**: lowerCamelCase property keys; TS props/types updated with XML changes; unique widget ID; captions/descriptions/defaults valid.
- **Mendix data API**:
    - Check `ActionValue.canExecute` before `execute()`.
    - Use `EditableValue.setValue()` for two-way binding.
    - Render loading/empty states until values are ready.

### React code-logic best practices

- **Hooks and effects**

    - Correct `useEffect`/`useMemo`/`useCallback` dependencies; avoid stale closures.
    - No side effects in render. Cleanup subscriptions/timers on unmount.
    - Guard async effects to avoid setting state after unmount:
        ```ts
        useEffect(() => {
            let active = true;
            (async () => {
                const data = await load();
                if (active) setData(data);
            })();
            return () => {
                active = false;
            };
        }, [load]);
        ```
    - Avoid deriving state directly from props unless necessary; prefer computing from props or synchronize carefully (watch for loops).

- **State management**

    - Use functional updates when reading previous state:
        ```ts
        setCount(c => c + 1);
        ```
    - Avoid unnecessary state for values derived from props. Keep state minimal and source-of-truth clear (controlled vs uncontrolled).
    - **MobX stores** for complex cross-component state; **React state** for simple UI state; **Mendix props** as source of truth for persistent data.

- **Rendering and lists**

    - Use stable, unique `key`s (avoid array index unless list is static).
    - Avoid heavy computations in render; memoize when there's proven benefit.
    - For large lists/tables, consider virtualization.

- **Performance hygiene**

    - Limit `useCallback`/`useMemo` to cases with measurable re-render cost; ensure dependency arrays are correct.
    - Avoid creating new objects/arrays/styles inline when passed to children repeatedly; memoize where needed.

- **Composition and props**

    - Prefer composition over prop drilling; consider Context when appropriate.
    - Don't spread unknown props onto DOM nodes (avoid React unknown prop warnings). Validate/filter props before spreading.

- **Accessibility**

    - Semantic elements, proper ARIA, focus management, and keyboard navigation.

- **Error handling and robustness**

    - Handle null/undefined from Mendix props; safe optional chaining; avoid non-null assertions unless justified.
    - Guard external data parsing; provide graceful fallbacks.
    - Avoid `dangerouslySetInnerHTML`; if unavoidable, sanitize input.

- **MobX best practices**
    - Use `makeAutoObservable(this)` or `makeObservable(this, { ... })` in store constructors.
    - Mark state mutations as `action`; use `computed` for derived values; avoid side effects in computed.
    - Use `reaction()` for side effects, not `autorun()` in most cases.
    - Integrate with React via `useSubscribe()` hook from `@mendix/widget-plugin-mobx-kit`.
    - Keep stores focused and avoid deep nesting; prefer composition over inheritance.

### Styling and theming

- Use **SCSS**; avoid inline styles for static design.
- Prefer **Atlas UI classes** (e.g., `btn`, `badge`); do not override core Atlas classes.
- Prefix custom classes with widget name; BEM-like naming.
- Responsive: relative units/media queries; avoid `!important`.

### Project/tooling consistency

- Follow ESLint/Prettier; do not change existing indentation style.
- For new deps: justify need/size; prefer tree-shakable imports; respect root `pnpm` versions/overrides.
- Don't modify generated bundles/patch files unless intended.

## Heuristics Copilot should apply

### Release/workflow checks

- Code or XML changed in `packages/**/<pkg>/` but no version bump or `CHANGELOG.md`:
    - "Behavior changed but no version bump or `CHANGELOG.md`. Please bump semver and add changelog (you can use `pnpm -w changelog`)."
- Features/bug fixes without tests:
    - "Please add/adjust unit tests in `src/__tests__/` to cover this change."
- XML changes without TS alignment:
    - "XML props changed but TS props/usage aren't aligned. Please update the component props/types and usage."

### React logic checks

- **Effect dependencies/stale closure**:
    - If an effect references variables not in the dependency array, request adding them or restructuring.
- **Async effect race**:
    - If an async effect sets state without a guard, suggest guarding or aborting as shown above.
- **Functional state updates**:
    - If using `setX(x + 1)` with potential stale reads, suggest `setX(x => x + 1)`.
- **Derived state anti-pattern**:
    - If `useState(props.someValue)` is used to mirror props without sync logic, suggest computing from props or explaining sync strategy.
- **List keys**:
    - If `index` is used as `key` in dynamic lists, request a stable unique key (e.g., id).
- **Unnecessary memo/callback**:
    - If `useMemo`/`useCallback` wraps cheap operations or has incorrect deps, suggest removing or fixing deps.
- **Inline allocations**:
    - Repeated inline objects/arrays/styles passed to children: suggest memoization to reduce renders.
- **Controlled vs uncontrolled**:
    - Inputs switching between `value` and `defaultValue` or missing `onChange` with `value`: flag and ask to make it consistently controlled or uncontrolled.
- **Unknown DOM props**:
    - Spreading arbitrary props to DOM nodes: ask to filter out non-standard props.

### MobX logic checks

- **Store setup**:
    - If a class has observable state but no `makeObservable`/`makeAutoObservable`, request adding it.
- **Action boundaries**:
    - If state is mutated outside `action`, suggest wrapping in `action` or `runInAction`.
- **Computed purity**:
    - If `computed` properties have side effects or mutations, suggest moving to `reaction` or regular methods.
- **React integration**:
    - If MobX stores are used without `observer` HOC or `useSubscribe` hook, request proper React integration.
- **Store architecture**:
    - If stores are deeply nested or overly complex, suggest breaking into focused, composable stores.

### Styling/scroll behavior

- Prefer root-cause layout/size fixes instead of programmatic scroll resets.

## Scope/Noise reduction

- Focus on: `src/**`, `*.xml`, `*.scss`, `package.json`, `CHANGELOG.md`, build/test config changes.
- Generally ignore: `dist/**`, lockfile-only churn, generated files.

## Quick commands

- Lint: `pnpm lint`
- Test: `pnpm test`
- Build: `pnpm build`
- Prepare changelog/version (workspace): `pnpm -w changelog`, `pnpm -w version`

## Tone and format for comments

- Be specific and actionable; reference files/lines.
- Prefer small, concrete suggestions; include short code snippets when helpful.
