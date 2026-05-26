# Reactive Chain Tracing

## Contents

- [Architecture Tiers](#architecture-tiers)
- [Tracing Procedure](#tracing-procedure)
- [Key Files: datagrid-web](#key-files-datagrid-web)
- [Example: Virtual Scrolling Bug](#example-virtual-scrolling-bug)

---

## Architecture Tiers

Before tracing, identify which architecture tier the widget uses:

| Tier                    | Examples                                       | Trace Path                                                                   |
| ----------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------- |
| **Simple**              | badge-web, color-picker-web, format-string-web | React props → Component render → DOM                                         |
| **Complex (DI + MobX)** | datagrid-web, gallery-web                      | React props → Gate → MobX stores → ComputedAtoms → Observer components → DOM |

**How to tell:** Look for a `model/containers/` directory or `Brandi` imports in the widget's `src/`. If they exist, it's a complex widget with dependency injection.

---

## Tracing Procedure

### Step A: Identify the DOM layer

Use your diagnostic script or browser DevTools to pin down:

- Which element is wrong? (CSS class, `role`, `data-` attribute)
- What CSS properties are incorrect? (`max-height`, `grid-template-columns`, `display`)
- What CSS custom properties feed those? (`--widgets-grid-body-height`, `--columns`)
- What data attributes indicate state? (`data-has-locked-height`, `aria-selected`)

### Step B: Find the rendering component

Grep the widget source for the CSS class or element attribute:

```bash
grep -r "widget-datagrid-grid-body\|data-has-locked-height" packages/pluggableWidgets/datagrid-web/src/
```

This points to the React component responsible for rendering the broken element.

### Step C: Identify the data source

**Simple widgets:** The component reads directly from React props. Check the `.tsx` entry file and trace from props to the rendered value.

**Complex widgets:**

1. Component uses an injection hook: `usePaginationVM()`, `useColumnsStore()`, `useGridSizeStore()`
2. Find the hook in `src/model/hooks/injection-hooks.ts`
3. Hook resolves a DI token from `src/model/tokens.ts`
4. Token is bound in a `BindingGroup` inside `src/model/containers/<Widget>.container.ts`
5. The bound class or factory function is the store or computed atom
6. The store reads from `gate.props` — the MobX observable that React props flow through

### Step D: Trace the computed value

For `ComputedAtom<T>` values (the most common pattern in complex widgets):

- Find the factory function, e.g., `gridStyleAtom`, `rowsAtom`, `pageSizeAtom`
- Read the factory to find its MobX dependencies
- Each dependency is either another `ComputedAtom` or a direct `observable` on a store
- Follow the chain until you find where the wrong value originates

### Step E: Find the root cause

Ask: where is the wrong value **first produced**?

Common root cause patterns:

- **Stale lock**: A value is computed once and cached, but the reset condition doesn't cover all invalidating events (e.g., `lockGridBodyHeight` only reset on page-size change, not column-count change)
- **Missing reactive dependency**: MobX doesn't track a read because it happened outside `computed()` or `autorun()` context
- **Wrong gate timing**: Effect fires on the React props cycle before MobX has propagated — use the MobX computed value as the dependency, not the raw React prop
- **Shared package mismatch**: Type errors or wrong behavior when a shared package (`widget-plugin-grid`) was not rebuilt after changes

---

## Key Files: datagrid-web

Use this as the template when a widget doesn't have an AGENTS.md yet. Always check for `AGENTS.md` in the widget directory first — it will have widget-specific routing.

| Layer           | File                                             | Role                                           |
| --------------- | ------------------------------------------------ | ---------------------------------------------- |
| Entry           | `src/Datagrid.tsx`                               | React component, creates container             |
| Container setup | `src/model/hooks/useDatagridContainer.ts`        | Initializes DI containers                      |
| DI bindings     | `src/model/containers/Datagrid.container.ts`     | `BindingGroup` objects, `injected()` calls     |
| Tokens          | `src/model/tokens.ts`                            | `CORE`, `DG`, `SA_TOKENS`                      |
| Injection hooks | `src/model/hooks/injection-hooks.ts`             | `useColumnsStore()`, `usePaginationVM()`, etc. |
| Gate            | `src/model/services/MainGateProvider.service.ts` | React → MobX props bridge                      |
| Grid sizing     | `src/model/stores/GridSize.store.ts`             | `lockGridBodyHeight()`, virtual scroll height  |
| Column state    | `src/helpers/state/column/ColumnGroupStore.tsx`  | Visibility, ordering, filters                  |
| CSS layout      | `src/model/models/grid.model.ts`                 | `gridStyleAtom` — CSS custom properties        |
| Components      | `src/components/*.tsx`                           | Observer components                            |

**Full architecture reference:** `packages/pluggableWidgets/datagrid-web/AGENTS.md`

---

## Example: Virtual Scrolling Bug

**Symptom:** Scrollbar disappears after hiding a column.

**Trace:**

1. **DOM:** `.widget-datagrid-grid-body` has `max-height: 781px` — this is the locked height. `scrollHeight` dropped below `clientHeight` → no overflow → no scrollbar.
2. **CSS var:** `--widgets-grid-body-height: 781px` on `.widget-datagrid-grid`. This is set from `GridSizeStore.gridBodyHeight`.
3. **Component:** `GridBody.tsx` applies `style={{ maxHeight: gridBodyHeight }}` from `useGridSizeStore()`.
4. **Store:** `GridSizeStore.lockGridBodyHeight()` sets `gridBodyHeight` once and only resets it when `pageSizeAtom` changes — not when column count changes.
5. **Root cause:** Missing reset condition in `lockGridBodyHeight()`. When a column is hidden, row heights can decrease (text no longer wraps), but the locked height stays stale.
6. **Fix:** Add a `lockedAtColumnCount` guard mirroring the existing `lockedAtPageSize` guard. Wire `visibleColumnsCountAtom` into `GridSizeStore` via DI.
