# React & MobX Patterns for Mendix Widgets

## Hooks

- `useEffect` deps array MUST include all referenced variables — no stale closures
- Async effects MUST guard against state updates after unmount:
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
- No side effects in render — use `useEffect` for side effects
- Cleanup subscriptions, timers, and event listeners on unmount

## State

- Use functional updates when reading previous state: `setCount(c => c + 1)`
- Do NOT store computed values in `useState` if they can be derived from props
- Source of truth priority: Mendix props → MobX store → React state
- Controlled vs. uncontrolled inputs: never mix `value` and `defaultValue` on the same element

## Keys & Lists

- Stable, unique `key` props on all list items — NEVER use array index for dynamic lists
- For large lists, consider virtualization

## MobX

- Stores: use `makeAutoObservable(this)` or explicit `makeObservable(this, { ... })` in the constructor
- State mutations: inside `action` or `runInAction` — never mutate observables outside an action
- Derived values: `computed` — no side effects allowed inside computed properties
- React integration: `observer()` HOC from `mobx-react-lite` + `useSubscribe()` from `@mendix/widget-plugin-mobx-kit`
- Use `reaction()` for side effects triggered by state changes, not `autorun()` in most cases

## Performance

- `useMemo`/`useCallback` only where re-render cost is measurable — incorrect deps are worse than no memoization
- Avoid creating new objects/arrays/functions inline in JSX props passed to child components (new reference on every render forces child re-render)

## Accessibility

- Semantic HTML first — ARIA only when native elements don't convey the right semantics
- WCAG 2.2 AA: 4.5:1 contrast for normal text, 3:1 for large text and UI elements
- Keyboard navigation: Arrow keys (menus/lists), Enter/Space (activation), Escape (dismiss), Tab (focus order)
- Use Floating UI accessibility hooks for floating elements: `useRole`, `useDismiss`, `useListNavigation`, `FloatingFocusManager`
- `dangerouslySetInnerHTML`: never — if unavoidable, sanitize with a trusted library

## Props

- Do NOT spread unknown props onto DOM nodes — filter non-HTML attributes before spreading
- Prefer composition over prop drilling; use React Context for cross-tree state when prop chains exceed 2-3 levels
