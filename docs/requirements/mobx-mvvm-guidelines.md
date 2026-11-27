# MobX MVVM Guidelines

How widgets that use MobX split state, logic and rendering. Applies to `datagrid-web`, `gallery-web`, the filter widgets and the shared `widget-plugin-*` packages.

The rules follow what the MobX, Vue and Svelte docs agree on:

- [MobX: defining data stores](https://mobx.js.org/defining-data-stores.html), [computeds](https://mobx.js.org/computeds.html), [reactions](https://mobx.js.org/reactions.html), [React integration](https://mobx.js.org/react-integration.html)
- [Vue: computed](https://vuejs.org/guide/essentials/computed.html), [composables](https://vuejs.org/guide/reusability/composables.html), [provide / inject](https://vuejs.org/guide/components/provide-inject.html)
- [Svelte: $derived](https://svelte.dev/docs/svelte/$derived), [$effect](https://svelte.dev/docs/svelte/$effect), [context](https://svelte.dev/docs/svelte/context)

## Layers

| Layer     | What it is                                                                 | Knows about                       | Never                                    |
| --------- | -------------------------------------------------------------------------- | --------------------------------- | ---------------------------------------- |
| Model     | Mendix props behind a gate, domain stores (columns, datasource, selection) | Mendix API, other models          | JSX, DOM, which view uses it             |
| ViewModel | One class per view, shaped by what that view needs                         | Models, config, other view-models | JSX, DOM refs, DOM reads                 |
| View      | `observer` component that injects one view-model                           | Its view-model, the DOM           | Business logic, combining several stores |
| Effect    | `SetupComponent` reaction that pushes state into an outside system         | Models                            | Copying one observable into another      |
| Hook      | React lifecycle glue (`useSetup`, event subscriptions, attaching DOM)      | React                             | Business logic                           |

Dependencies are injected through the container (brandi tokens), the same role as Vue's `provide`/`inject` and Svelte's `createContext`.

## Rules

### Derived values are computeds, and computeds are pure

- Derive with getters (`computed`). Don't store what can be derived.
- A computed has no side effects, creates no observables and reads only observable inputs. A DOM read or `Date.now()` inside a computed is not tracked and goes stale.
- `computed(() => …).get()` inside an observer only helps when the result is comparable (a string, a boolean, a number). A new object or React element always counts as changed.

### Effects are a last resort

- Use a reaction only when cause and effect have no direct relation, and only to push state outside MobX: the Mendix datasource, storage, a registry.
- Never use a reaction, `autorun` or `useEffect` to copy one value into another observable. Make it a getter that reads the source, for example a gate (`gate.props.columns[i].header`).
- Every reaction belongs to a `SetupComponent` and is disposed.

### Only the owner changes state

- State changes through methods on the class that owns it, named for the intent (`toggleSort`, `hideColumn`, `loadMore`).
- Don't assign another store's fields (`column.isHidden = …`, `sorting.rules = …`) and don't read its `_private` members.
- Tokens expose a readonly interface, not the concrete class.

### View-models own the logic, views only bind

- Every condition a view would compute (`a && b.c`, choosing between spinner, skeleton and rows, which pagination to show) is a view-model getter.
- Each binding in a view is a single expression: `vm.ariaSort`, `vm.isVisible`, `onClick={vm.toggleSort}`. Create view-models with `makeAutoObservable(this, undefined, { autoBind: true })` so actions passed as handlers keep `this`.
- Logic that lives in a hook (`useState` drag state, scroll maths, prop-sync effects) moves to a view-model or a feature class.
- A view reads one view-model. If it needs three stores, it needs a view-model that combines them.

### The DOM belongs to the view

- Views own refs. When a view-model needs a size, the view measures it (ref callback or hook) and passes plain numbers to an action: `vm.lockHeight({ body, header })`.
- View-models and models never hold `RefObject`s and never call `querySelector`, `offsetWidth` or `clientHeight`.
- Models never return JSX. Rendering cell content or filter widgets is a view's job.

### Every component that reads observables is an `observer`

- Wrap with `observer(function Name() { … })`, using a named function.
- Pass objects and dereference late: `<Row row={row} />`, not `<Row selected={row.selected} />`.
- Render list items as their own observer components with stable keys.
- For values that take an argument (per row, per cell), prefer keeping the state on the item (a row view-model) over `computedFn`.

## Example

```ts
export class ColumnHeaderViewModel {
    constructor(
        private column: GridColumn,
        private config: { columnsSortable: boolean },
        private drag: ColumnDragViewModel
    ) {
        makeAutoObservable(this, undefined, { autoBind: true });
    }

    get canSort(): boolean {
        return this.config.columnsSortable && this.column.canSort;
    }

    get ariaSort(): "ascending" | "descending" | "none" | undefined {
        return this.canSort ? toAriaSort(this.column.sortDir) : undefined;
    }

    get isDropTarget(): boolean {
        return this.drag.target?.columnId === this.column.columnId;
    }

    toggleSort(): void {
        this.column.toggleSort();
    }
}
```

```tsx
export const Header = observer(function Header(): ReactElement {
    const vm = useColumnHeaderVM();
    return (
        <div role="columnheader" aria-sort={vm.ariaSort} onClick={vm.toggleSort}>
            {vm.caption}
        </div>
    );
});
```

## Known gaps in `datagrid-web`

Places that don't follow these rules yet. Fix them as small PRs that don't change behaviour, one at a time.

| Rule                           | Where                                                                                                                             |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| Missing `observer`             | `GridHeader.tsx`, `features/columns/Header.tsx`, `Row.tsx`, `WidgetHeader.tsx`                                                    |
| Effect copies state            | `ColumnGroupStore.setup` copies `gate.props.columns` into `ColumnStore` fields; `useDataExport` syncs props with six `useEffect`s |
| Computed reads the DOM         | `WidgetRootViewModel.style` reads `ref.current.offsetHeight`                                                                      |
| View-model owns the DOM        | `GridSizeStore` holds three refs and measures rows and header                                                                     |
| Model renders JSX or reads DOM | `ColumnStore.renderCellContent`, `ColumnStore.takeSizeSnapshot`, `ColumnFilterStore.renderFilterWidgets`                          |
| Logic in hooks                 | `useDraggable` and its `useState` in `GridHeader`, scroll maths in `useInfiniteControl`                                           |
| Logic in views                 | `ContentGuard` in `GridBody.tsx`, footer and top bar visibility conditions, `Header` combining config and column                  |
| Non-owner mutation             | `ColumnGroupStore` writes `isHidden`, `orderWeight`, `sorting.rules`; `GridPersonalizationStore` reads `_allColumns`              |
