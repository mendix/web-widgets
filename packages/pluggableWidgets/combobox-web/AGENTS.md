# Combobox-Web Widget — Agent Context

## Overview

Configurable dropdown widget supporting single/multi-selection across 3 data source modes: **context** (association, enum, boolean), **database**, and **static**. Uses React + TypeScript with Downshift for accessible combobox behavior. No MobX — pure React state + class-based selectors/providers.

- **Version:** 2.8.0
- **Min Mendix:** 10.22.0
- **Key deps:** `downshift` (headless combobox), `match-sorter` (fuzzy filtering), `classnames`

---

## Architecture

### Entry Point

`src/Combobox.tsx` — receives `ComboboxContainerProps`, calls `useGetSelector(props)` to get a `Selector` instance, then conditionally renders `SingleSelection` or `MultiSelection` (or `Placeholder` if unavailable).

### Component Tree

```
Combobox (src/Combobox.tsx)
├── Placeholder (unavailable state)
├── SingleSelection (src/components/SingleSelection/SingleSelection.tsx)
│   ├── ComboboxWrapper (input container, clear button, validation)
│   │   ├── input (search/display)
│   │   ├── InputPlaceholder
│   │   ├── ClearButton / SpinnerLoader / DownArrow (icons)
│   │   └── ValidationAlert
│   └── SingleSelectionMenu (src/components/SingleSelection/SingleSelectionMenu.tsx)
│       └── ComboboxMenuWrapper
│           ├── menuHeaderContent (optional)
│           ├── ul > ComboboxOptionWrapper[] (per option)
│           ├── Loader
│           ├── NoOptionsPlaceholder
│           └── menuFooterContent (optional)
└── MultiSelection (src/components/MultiSelection/MultiSelection.tsx)
    ├── ComboboxWrapper (same structure, + selected item boxes with remove buttons)
    └── MultiSelectionMenu (src/components/MultiSelection/MultiSelectionMenu.tsx)
        └── ComboboxMenuWrapper
            ├── SelectAllButton (three-state checkbox)
            ├── ul > ComboboxOptionWrapper[] (with optional checkboxes)
            ├── Loader
            └── menuFooterContent (optional)
```

### Wrapper & UI Components

| Component             | File                                                | Purpose                                           |
| --------------------- | --------------------------------------------------- | ------------------------------------------------- |
| ComboboxWrapper       | `src/components/ComboboxWrapper.tsx`                | Input container, toggle, clear button, validation |
| ComboboxMenuWrapper   | `src/components/ComboboxMenuWrapper.tsx`            | Dropdown positioning, header/footer               |
| ComboboxOptionWrapper | `src/components/ComboboxOptionWrapper.tsx`          | Individual option with selection/highlight state  |
| SelectAllButton       | `src/components/MultiSelection/SelectAllButton.tsx` | Three-state checkbox for select-all               |
| Placeholder           | `src/components/Placeholder.tsx`                    | Unavailable, no-options, input placeholder states |
| Loader                | `src/components/Loader.tsx`                         | Loading state (spinner or skeleton)               |
| SpinnerLoader         | `src/components/SpinnerLoader.tsx`                  | Spinner animation                                 |
| SkeletonLoader        | `src/components/SkeletonLoader.tsx`                 | Skeleton loading animation                        |
| Icons                 | `src/assets/icons.tsx`                              | ClearButton, DownArrow, Checkbox SVGs             |

### Editor/Preview

- `src/Combobox.editorPreview.tsx` — Studio Pro preview component
- `src/Combobox.editorConfig.ts` — Studio Pro editor configuration

### Styling

- `src/ui/Combobox.scss` — all widget styles
- CSS class prefix: `.widget-combobox-*`
- Key classes: `-input-container`, `-selected-items`, `-input`, `-menu`, `-menu-list`, `-item`, `-item-selected`, `-item-highlighted`, `-clear-button`

---

## Selector/Provider Pattern

The core abstraction that lets 3 data source modes share one UI. This is a **Strategy + Factory** pattern.

### Selector Factory

`src/helpers/getSelector.ts` — routes to the correct selector class:

```
props.source
├── "context"
│   ├── optionsSourceType: "enumeration" | "boolean" → EnumBooleanSingleSelector
│   └── optionsSourceType: "association"
│       ├── attributeAssociation.type: "Reference"    → AssociationSingleSelector
│       └── attributeAssociation.type: "ReferenceSet" → AssociationMultiSelector
├── "database"
│   ├── itemSelection.type: "Multi" → DatabaseMultiSelectionSelector
│   └── else                        → DatabaseSingleSelectionSelector
└── "static" → StaticSingleSelector
```

### Selector Hierarchy

```
SelectorBase<T, V> (interface in src/helpers/types.ts)
├── SingleSelector (T="single", V=string)
│   ├── AssociationSingleSelector  (src/helpers/Association/AssociationSingleSelector.ts)
│   ├── DatabaseSingleSelectionSelector (src/helpers/Database/DatabaseSingleSelectionSelector.ts)
│   ├── EnumBooleanSingleSelector  (src/helpers/EnumBool/EnumBoolSingleSelector.tsx)
│   └── StaticSingleSelector       (src/helpers/Static/StaticSingleSelector.ts)
└── MultiSelector (T="multi", V=string[])
    ├── AssociationMultiSelector    (src/helpers/Association/AssociationMultiSelector.ts)
    └── DatabaseMultiSelectionSelector (src/helpers/Database/DatabaseMultiSelectionSelector.ts)
```

### Provider Composition

Each selector holds provider instances that abstract data access:

| Provider             | Interface                         | Purpose                                                                        |
| -------------------- | --------------------------------- | ------------------------------------------------------------------------------ |
| **OptionsProvider**  | `src/helpers/types.ts`            | Filterable, searchable options list. Handles lazy loading, debounced filtering |
| **CaptionsProvider** | `src/helpers/types.ts`            | Renders display text/custom content for each option                            |
| **ValuesProvider**   | `src/helpers/types.ts`            | Maps option keys to actual Mendix values (database/static only)                |
| **LazyLoadProvider** | `src/helpers/LazyLoadProvider.ts` | Manages datasource pagination limits                                           |

### OptionsProvider Hierarchy

```
BaseOptionsProvider<T, P> (src/helpers/BaseOptionsProvider.ts)
  — Client-side match-sorter filtering
  └── BaseDatasourceOptionsProvider (src/helpers/BaseDatasourceOptionsProvider.ts)
      — Server-side OData filtering with debounce, lazy loading, pagination
      ├── AssociationOptionsProvider (src/helpers/Association/AssociationOptionsProvider.ts)
      └── DatabaseOptionsProvider   (src/helpers/Database/DatabaseOptionsProvider.ts)

BaseOptionsProvider<T, P> (standalone implementations)
├── StaticOptionsProvider    (src/helpers/Static/StaticOptionsProvider.ts)
└── EnumBoolOptionsProvider  (src/helpers/EnumBool/EnumBoolOptionsProvider.ts)
```

### CaptionsProvider Implementations

| Implementation                       | File                                                            | Data Source  |
| ------------------------------------ | --------------------------------------------------------------- | ------------ |
| AssociationSimpleCaptionsProvider    | `src/helpers/Association/AssociationSimpleCaptionsProvider.tsx` | Association  |
| DatabaseCaptionsProvider             | `src/helpers/Database/DatabaseCaptionsProvider.tsx`             | Database     |
| StaticCaptionsProvider               | `src/helpers/Static/StaticCaptionsProvider.tsx`                 | Static       |
| EnumAndBooleanSimpleCaptionsProvider | `src/helpers/EnumBool/EnumAndBooleanSimpleCaptionsProvider.tsx` | Enum/Boolean |

### Generics Usage

- `OptionsProvider<T, P>` — T = value type, P = props type for `_updateProps()`
- `SelectorBase<T, V>` — T = "single"\|"multi", V = string\|string[]
- `BaseAssociationSelector<T, R>` — T extends string\|string[], R extends ReferenceValue\|ReferenceSetValue
- `DatabaseSingleSelectionSelector<T, R>` — T extends string\|Big, R extends EditableValue\<T\>
- `EnumBoolOptionsProvider<T extends boolean | string>`

---

## State Management & Data Flow

### Hooks

| Hook                              | File                                         | Purpose                                                                                            |
| --------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **useGetSelector**                | `src/hooks/useGetSelector.ts`                | Creates selector once (useRef), calls updateProps() each render, manages debounced filter callback |
| **useActionEvents**               | `src/hooks/useActionEvents.ts`               | Wires focus/blur to onEnter/onLeave Mendix actions                                                 |
| **useDownshiftSingleSelectProps** | `src/hooks/useDownshiftSingleSelectProps.ts` | Wraps Downshift useCombobox for single-select                                                      |
| **useDownshiftMultiSelectProps**  | `src/hooks/useDownshiftMultiSelectProps.ts`  | Wraps Downshift useMultipleSelection + useCombobox                                                 |
| **useLazyLoading**                | `src/hooks/useLazyLoading.ts`                | Infinite scroll via useInfiniteControl from grid plugin                                            |
| **useMenuStyle**                  | `src/hooks/useMenuStyle.ts`                  | Dynamic dropdown positioning with debounced style updates                                          |

### Data Flow

```
Mendix Runtime (EditableValue, ListValue, ActionValue, etc.)
  │
  ↓ props
Combobox.tsx
  │
  ├─ useGetSelector(props) → Selector instance (useRef, singleton)
  │    └─ selector.updateProps(props) → updates all nested providers
  │
  ├─ useActionEvents(selector, props) → onFocus/onBlur handlers
  │
  ↓ selector + commonProps
SingleSelection / MultiSelection
  │
  ├─ useDownshift*Props(selector) → Downshift state (isOpen, inputValue, etc.)
  ├─ useLazyLoading(selector.options) → onScroll handler
  ├─ useMenuStyle() → dropdown positioning
  │
  ↓ getInputProps, getMenuProps, getItemProps
ComboboxWrapper + Menu components
  │
  ↓ user interaction (click option)
Downshift onSelectedItemChange
  │
  ↓
selector.setValue(selectedItem)
  │
  ├─ EditableValue.setValue() / ReferenceValue.setValue()
  ├─ executeAction(onChange)
  └─ Update currentId
  │
  ↓ Mendix framework re-renders widget with new props
```

### Mendix API Types Consumed

| Type                     | Usage                                                                                    |
| ------------------------ | ---------------------------------------------------------------------------------------- |
| `EditableValue<T>`       | Target attribute — read `.value`, update `.setValue()`, check `.readOnly`, `.validation` |
| `ListValue`              | Datasource — `.items`, `.status`, `.hasMoreItems`, `.setFilter()`, `.setLimit()`         |
| `ListAttributeValue<T>`  | Attribute from list items for captions/values — `.get(objectItem)`                       |
| `ListExpressionValue<T>` | Dynamic expression per list item                                                         |
| `ListWidgetValue`        | Custom widget content per option                                                         |
| `ReferenceValue`         | Single association — `.value` is ObjectItem, `.setValue()`                               |
| `ReferenceSetValue`      | Multi association — `.value` is ObjectItem[]                                             |
| `ActionValue`            | Callbacks — checked via `canExecute`, triggered via `executeAction()`                    |
| `DynamicValue<T>`        | Dynamic props (noOptionsText, emptyOptionText, ariaLabel)                                |

### Events

| Event               | Trigger                          | Handler                                                              |
| ------------------- | -------------------------------- | -------------------------------------------------------------------- |
| onChange            | User selects/clears item         | `selector.setValue()` → `executeAction(onChangeEvent)`               |
| onEnter             | Focus enters widget              | `useActionEvents.onFocus` → `executeAction(onEnterEvent)`            |
| onLeave             | Focus leaves widget              | `useActionEvents.onBlur` → `executeAction(onLeaveEvent)`             |
| onChangeFilterInput | User types in search (debounced) | `useGetSelector` → `onChangeFilterInputEvent.execute({filterInput})` |

### Performance Patterns

| Pattern                     | Location                      | Interval                            |
| --------------------------- | ----------------------------- | ----------------------------------- |
| Debounced filter input      | useGetSelector                | 200ms (configurable)                |
| Debounced datasource filter | BaseDatasourceOptionsProvider | 200ms (configurable)                |
| Debounced menu position     | useMenuStyle                  | 32ms (~60fps)                       |
| Memoized Downshift config   | useDownshift\*Props           | useMemo with selector deps          |
| Singleton selector          | useGetSelector                | useRef (created once)               |
| Lazy loading                | useLazyLoading                | useInfiniteControl from grid plugin |

---

## Types & Auto-Generated Props

### Key Enums (from `typings/ComboboxProps.d.ts`)

```typescript
SourceEnum = "context" | "database" | "static";
OptionsSourceTypeEnum = "association" | "enumeration" | "boolean";
FilterTypeEnum = "contains" | "containsExact" | "startsWith" | "none";
SelectionMethodEnum = "checkbox" | "rowclick";
SelectedItemsStyleEnum = "text" | "boxes";
LoadingTypeEnum = "spinner" | "skeleton";
SelectedItemsSortingEnum = "caption" | "none";
CustomContentTypeEnum = "yes" | "listItem" | "no";
CaptionTypeEnum = "attribute" | "expression";
```

### Internal Types (from `src/helpers/types.ts`)

```typescript
Selector = SingleSelector | MultiSelector; // discriminated union on .type
Status = "unavailable" | "loading" | "available";
CaptionPlacement = "label" | "options";
SelectionType = "single" | "multi";
SortOrder = "asc" | "desc";
```

### Utility Helpers (`src/helpers/utils.ts`)

- `_valuesIsEqual(a, b)` — compares string | Big | boolean | Date | undefined
- `sortSelectedItems(values, sortingType, sortOrder, captionGetter)` — sorts selected items
- `getFilterTypeOptions(filter)` — returns match-sorter config for filter type

### Per-Source Utilities

- `src/helpers/Association/utils.ts` — `extractAssociationProps()` extracts typed props tuple
- `src/helpers/Database/utils.ts` — database-specific prop extraction
- `src/helpers/EnumBool/utils.ts` — enum/boolean prop extraction
- `src/helpers/Static/utils.ts` — static data source prop extraction

---

## Testing

### Unit Tests (`src/__tests__/`)

| File                       | LOC  | Covers                                                                          |
| -------------------------- | ---- | ------------------------------------------------------------------------------- |
| `SingleSelection.spec.tsx` | ~185 | Association single-select: render, toggle, select, remove, lazy loading         |
| `MultiSelection.spec.tsx`  | ~188 | ReferenceSet multi-select: render, toggle, add/remove, select-all, lazy loading |
| `StaticSelection.spec.tsx` | ~147 | Static values: render, toggle, select/remove                                    |

**Run:** `cd packages/pluggableWidgets/combobox-web && pnpm run test`

### Mocking Strategy

Uses `@mendix/widget-plugin-test-utils` builders:

- `EditableValueBuilder<T>` — mocks EditableValue with `.withValue()`, `.isReadOnly()`, `.isLoading()`
- `ReferenceValueBuilder` — mocks ReferenceValue (single association)
- `ReferenceSetValueBuilder` — mocks ReferenceSetValue (multi association)
- `ListValueBuilder` — mocks ListValue datasource with `.withItems()`, `.withHasMore()`
- `dynamic(value?)` — wraps in DynamicValue
- `obj(id?)` — creates mock ObjectItem
- `list(items)` — creates mock ListValue
- `setupIntersectionObserverStub()` — stubs browser IntersectionObserver

### E2E Tests (`e2e/Combobox.spec.js`, ~195 LOC)

**Run:** `cd packages/pluggableWidgets/combobox-web && pnpm run e2e`

| Category              | Scenarios                                                                                 |
| --------------------- | ----------------------------------------------------------------------------------------- |
| Data source types     | Association, association + rowclick, enum, enum + footer, read-only, static, database     |
| Searching & selecting | Filter results, remove single/all, backspace clear, type while selected, multi + rowclick |

Uses Playwright with visual regression (18 screenshots). Session management: logs out after each test to respect Mendix 5-session limit.

### Build & Config

| Config     | File                    | Notes                                                    |
| ---------- | ----------------------- | -------------------------------------------------------- |
| Rollup     | `rollup.config.mjs`     | Delegates to `@mendix/rollup-web-widgets`                |
| TypeScript | `tsconfig.json`         | ES6 target, strict mode, react-jsx                       |
| ESLint     | `eslint.config.mjs`     | Shared `@mendix/eslint-config-web-widgets/widget-ts.mjs` |
| Prettier   | `.prettierrc.js`        | Shared `@mendix/prettier-config-web-widgets`             |
| Playwright | `playwright.config.cjs` | Shared `@mendix/run-e2e/playwright.config.cjs`           |

### Key Scripts

```
pnpm run test    — Unit tests (Jest)
pnpm run build   — Production build
pnpm run dev     — Dev server with hot reload
pnpm run start   — Start server (set MX_PROJECT_PATH first)
pnpm run e2e     — E2E tests (CI)
pnpm run e2edev  — E2E tests (dev mode)
pnpm run lint    — ESLint
pnpm run format  — Prettier
```

---

## File Index

### Core

- `src/Combobox.tsx` — entry point
- `src/Combobox.xml` — widget XML definition (100+ properties)
- `src/Combobox.editorPreview.tsx` — Studio Pro preview
- `src/Combobox.editorConfig.ts` — Studio Pro editor config
- `src/ui/Combobox.scss` — styles
- `typings/ComboboxProps.d.ts` — auto-generated types from XML

### Components

- `src/components/SingleSelection/SingleSelection.tsx`
- `src/components/SingleSelection/SingleSelectionMenu.tsx`
- `src/components/MultiSelection/MultiSelection.tsx`
- `src/components/MultiSelection/MultiSelectionMenu.tsx`
- `src/components/MultiSelection/SelectAllButton.tsx`
- `src/components/ComboboxWrapper.tsx`
- `src/components/ComboboxMenuWrapper.tsx`
- `src/components/ComboboxOptionWrapper.tsx`
- `src/components/Placeholder.tsx`
- `src/components/Loader.tsx`
- `src/components/SpinnerLoader.tsx`
- `src/components/SkeletonLoader.tsx`
- `src/assets/icons.tsx`

### Hooks

- `src/hooks/useGetSelector.ts`
- `src/hooks/useActionEvents.ts`
- `src/hooks/useDownshiftSingleSelectProps.ts`
- `src/hooks/useDownshiftMultiSelectProps.ts`
- `src/hooks/useLazyLoading.ts`
- `src/hooks/useMenuStyle.ts`

### Selectors

- `src/helpers/getSelector.ts` — factory router
- `src/helpers/types.ts` — core interfaces
- `src/helpers/utils.ts` — shared utilities
- `src/helpers/BaseOptionsProvider.ts` — base options with match-sorter
- `src/helpers/BaseDatasourceOptionsProvider.ts` — base with OData filtering + lazy load
- `src/helpers/LazyLoadProvider.ts` — pagination management

### Association Mode

- `src/helpers/Association/BaseAssociationSelector.ts`
- `src/helpers/Association/AssociationSingleSelector.ts`
- `src/helpers/Association/AssociationMultiSelector.ts`
- `src/helpers/Association/AssociationOptionsProvider.ts`
- `src/helpers/Association/AssociationSimpleCaptionsProvider.tsx`
- `src/helpers/Association/utils.ts`

### Database Mode

- `src/helpers/Database/DatabaseSingleSelectionSelector.ts`
- `src/helpers/Database/DatabaseMultiSelectionSelector.ts`
- `src/helpers/Database/DatabaseOptionsProvider.ts`
- `src/helpers/Database/DatabaseCaptionsProvider.tsx`
- `src/helpers/Database/DatabaseValuesProvider.ts`
- `src/helpers/Database/utils.ts`

### Enum/Boolean Mode

- `src/helpers/EnumBool/EnumBoolSingleSelector.tsx`
- `src/helpers/EnumBool/EnumBoolOptionsProvider.ts`
- `src/helpers/EnumBool/EnumAndBooleanSimpleCaptionsProvider.tsx`
- `src/helpers/EnumBool/utils.ts`

### Static Mode

- `src/helpers/Static/StaticSingleSelector.ts`
- `src/helpers/Static/StaticOptionsProvider.ts`
- `src/helpers/Static/StaticCaptionsProvider.tsx`
- `src/helpers/Static/utils.ts`

### Preview Selectors (Studio Pro)

- `src/helpers/Association/Preview/AssociationPreviewSelector.ts`
- `src/helpers/Database/Preview/DatabasePreviewSelector.ts`
- `src/helpers/Static/Preview/StaticPreviewSelector.ts`

### Tests

- `src/__tests__/SingleSelection.spec.tsx`
- `src/__tests__/MultiSelection.spec.tsx`
- `src/__tests__/StaticSelection.spec.tsx`
- `e2e/Combobox.spec.js`
