# Combobox-Web Domain Glossary

## Selector

The class that ties a data source mode to the UI. One Selector instance exists per widget mount (singleton via `useRef`). It holds the current value, exposes `setValue()`, and owns the `OptionsProvider` and `CaptionsProvider` for its mode.

Variants: `AssociationSingleSelector`, `AssociationMultiSelector`, `DatabaseSingleSelectionSelector`, `DatabaseMultiSelectionSelector`, `EnumBooleanSingleSelector`, `StaticSingleSelector`.

**Do not say:** handler, adapter, source, strategy.

## OptionsProvider

The object responsible for the filterable, searchable list of available options. Owned by a Selector. Handles client-side filtering (match-sorter) for enum/boolean/static modes, and server-side OData filtering + debounce + pagination for association and database modes.

**Do not say:** options list, data provider, item source.

## CaptionsProvider

The object that renders display text or custom widget content for each option. Owned by a Selector. Has separate implementations per data source mode.

**Do not say:** label provider, display provider, renderer.

## SingleSelector / MultiSelector

The two selection modes. SingleSelector holds one value (`string`); MultiSelector holds many (`string[]`). Discriminated by `.type` ("single" | "multi"). The UI branches on this — `SingleSelection` component for one, `MultiSelection` for the other.

**Do not say:** single-select mode, multi-select mode, single picker, multi picker.

## Data Source Modes

Three modes determine where options come from:

- **Context mode** (`source: "context"`) — options from the surrounding Mendix data context: association, enumeration, or boolean attribute.
- **Database mode** (`source: "database"`) — options from a Mendix datasource (ListValue) with server-side OData filtering and pagination.
- **Static mode** (`source: "static"`) — options defined at design time in Studio Pro.

**Do not say:** source type, data type, provider mode.

## Lazy Loading

Loading additional options incrementally as the user scrolls the dropdown. Applies to database mode and association mode only (server-side datasources). Managed by `LazyLoadProvider` + `useLazyLoading` hook via `useInfiniteControl`.

**Do not say:** infinite scroll, pagination, on-demand loading.

## Menu Header / Menu Footer

Optional widget content slots rendered above and below the options list in the dropdown. Configured in Studio Pro via `menuHeaderContent` / `menuFooterContent` props. Only footer is available in enum/static modes; both are available in database/association modes.

**Do not say:** header slot, footer slot, header content, footer content.

## Select All

Three-state checkbox in MultiSelector mode that selects or deselects all currently visible options. Lives at the top of the dropdown menu. States: all selected, none selected, partial selection (indeterminate).

**Do not say:** bulk select, check all, toggle all.

## Filtering

Narrowing the options list as the user types. Four modes: `contains`, `containsExact`, `startsWith`, `none`. Client-side via match-sorter for enum/boolean/static modes; server-side OData for database/association modes (debounced 200ms).

**Do not say:** search, type-ahead, autocomplete, query.

## Widget Status

Three lifecycle states that drive rendering:

- **unavailable** — Mendix data not ready; renders `Placeholder`
- **loading** — data loading; renders `Loader` (spinner or skeleton)
- **available** — data ready; renders `SingleSelection` or `MultiSelection`

**Do not say:** uninitialized, pending, ready, idle.
