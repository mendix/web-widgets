## Test Cases

All tests are unit tests at the `Selector` seam unless marked otherwise. They are written against the current code and must pass unchanged on any refactoring of the selectors. Props come from `src/helpers/__tests__/fixtures.ts`; Mendix values come from the builders in `@mendix/widget-plugin-test-utils`.

### Selector factory (`getSelector.spec.ts`)

- Routes every Studio Pro configuration to its selector class
    - **Given**: props with `source` and `optionsSourceType` for each family (context + enumeration, context + boolean, context + association with `Reference`, context + association with `ReferenceSet`, database + `Single` selection, database + `Multi` selection, database without selection, static)
    - **When**: `getSelector(props)`
    - **Then**: instance of `EnumBooleanSingleSelector`, `EnumBooleanSingleSelector`, `AssociationSingleSelector`, `AssociationMultiSelector`, `DatabaseSingleSelectionSelector`, `DatabaseMultiSelectionSelector`, `DatabaseSingleSelectionSelector`, `StaticSingleSelector` respectively, with `type` `"single"` or `"multi"` to match
- Rejects unsupported configurations
    - **Given**: `source: "context"` with an unknown `optionsSourceType`, or an unknown `source`
    - **When**: `getSelector(props)`
    - **Then**: throws

### Association, single (`AssociationSingleSelector.spec.ts`)

- Exposes the bound value and flags once props are available
    - **Given**: `ReferenceValue` with a value, datasource with that item, caption attribute, `clearable: true`
    - **When**: `updateProps`
    - **Then**: `status` `"available"`, `currentId` is the item id, `readOnly` false, `clearable` true, `validation` undefined, `type` `"single"`, `customContentType` and `loadingType` passed through
- Treats a missing or unavailable reference, datasource or empty-option text as unavailable
    - **Given**: one of those three unavailable (including `emptyOptionText: undefined`)
    - **When**: `updateProps`
    - **Then**: `status` `"unavailable"`, `currentId` null, `clearable` false
- Transitions from unavailable to available
    - **Given**: first `updateProps` with a loading reference, second with an available one
    - **When**: both calls
    - **Then**: status and `currentId` follow the second call
- Passes read-only and validation through
    - **Given**: reference built with `isReadOnly()` and `withValidation("Required")`
    - **When**: `updateProps`
    - **Then**: `readOnly` true, `validation` `"Required"`
- Writes the selection to the reference
    - **Given**: available props
    - **When**: `setValue(id)` then `setValue(null)`
    - **Then**: `attr.setValue` called with the `ObjectItem` for the id, then with `undefined`
- Resolves captions through the attribute and through the expression
    - **Given**: caption type `"attribute"`, then `"expression"`
    - **When**: `caption.get(id)`, `caption.get(null)`, `caption.get("unknown")`
    - **Then**: the caption, the empty-option text, `"<...>"`
- Keeps a caption for a selected item that is not in the datasource page
    - **Given**: reference value whose item is not in `ds.items`
    - **When**: `updateProps`
    - **Then**: `options.getAll()` does not include it, `caption.get(id)` still resolves
- Filters options client-side by caption
    - **Given**: four items with captions, `filterType` `"contains"`, `"containsExact"`, `"startsWith"`, `"none"`
    - **When**: `options.setSearchTerm(term)` and `options.getAll()`
    - **Then**: `contains` and `containsExact` match substrings, `startsWith` matches word starts only, `none` returns every option regardless of the term; an empty term returns options in datasource order
- Notifies after a search-term change
    - **Given**: callback registered with `options.onAfterSearchTermChange`
    - **When**: `options.setSearchTerm("a")`
    - **Then**: callback called once
- Manages the datasource limit
    - **Given**: `lazyLoading: false`
    - **When**: `updateProps`
    - **Then**: `ds.setLimit(undefined)` is called (limit removed)
    - **Given**: `lazyLoading: false`, read-only reference
    - **Then**: `ds.setLimit(0)` is called (no options loaded for a read-only control)
    - **Given**: `lazyLoading: true`, caption attribute, available
    - **Then**: `lazyLoading` true on the selector, `ds.setLimit` not called when the limit is already right
    - **Given**: `lazyLoading: true` with caption type `"expression"`
    - **Then**: `lazyLoading` false (server-side filter needs an attribute)
- Lazy loading loads the next page
    - **Given**: `lazyLoading: true`, `ds.hasMoreItems` true, `ds.limit` 100
    - **When**: `options.loadMore()`
    - **Then**: `ds.setLimit(200)`, `options.isLoading` true until the next `updateProps` with an available datasource
    - **Given**: `ds.hasMoreItems` false
    - **Then**: `setLimit` not called
- Lazy loading moves the filter to the datasource (fake timers)
    - **Given**: `lazyLoading: true`, `filterInputDebounceInterval` 200
    - **When**: `options.setSearchTerm("ab")`, `options.getAll()`, advance 200 ms
    - **Then**: `getAll` returns the unfiltered page, `ds.setFilter` called once after the interval; with an empty term `ds.setFilter(undefined)`
- Reports datasource state
    - **Given**: `ds.sortOrder` `[[attr, "desc"]]`, `ds.hasMoreItems` true
    - **When**: read `options.sortOrder`, `options.hasMore`, `options.status`
    - **Then**: `"desc"`, true, `"available"`
- Renders captions according to custom-content type (unit, React)
    - **Given**: `customContentType` `"no"`, `"listItem"`, `"yes"` with a `ListWidgetValue`
    - **When**: `caption.render(id, "label")` and `caption.render(id, "options")`
    - **Then**: `"no"` renders text in both placements; `"listItem"` renders text for `"label"` and custom content for `"options"`; `"yes"` renders custom content in both; `null` renders the empty text

### Association, multi (`AssociationMultiSelector.spec.ts`)

- Exposes the selected ids in reference order
    - **Given**: `ReferenceSetValue` with items B, A
    - **When**: `updateProps` with `selectedItemsSorting: "none"`
    - **Then**: `currentId` `[B, A]`
- Sorts selected ids by caption when configured
    - **Given**: same, `selectedItemsSorting: "caption"`, datasource sort order asc then desc
    - **Then**: `[A, B]` then `[B, A]`
- Writes the selection to the reference set
    - **When**: `setValue([A, B])`, `setValue([])`
    - **Then**: `attr.setValue` with the two `ObjectItem`s, then with `[]`
- Hides selected options in row-click mode
    - **Given**: `selectionMethod: "rowclick"`, A selected
    - **When**: `getOptions()`
    - **Then**: A absent; with `"checkbox"` A present
- Reports the three-state select-all value
    - **Given**: none selected, some selected, all selected, and no options at all
    - **When**: `isOptionsSelected()`
    - **Then**: `"none"`, `"some"`, `"all"`, `"some"`
- Forces boxes style for row click and custom content
    - **Given**: `selectedItemsStyle: "text"` with `selectionMethod: "rowclick"`, then with `customContentType: "yes"`
    - **Then**: `selectedItemsStyle` `"boxes"` in both; stays `"text"` otherwise
- Passes multi-select configuration through
    - **Then**: `selectAllButton`, `selectionMethod`, `selectedItemsSorting` equal the props
- Unavailable reference set clears the selection
    - **Then**: `status` `"unavailable"`, `currentId` null

### Enumeration and boolean (`EnumBoolSingleSelector.spec.ts`)

- Builds options from the attribute universe
    - **Given**: enumeration attribute with universe `["red", "green", "blue"]`, value `"green"`
    - **When**: `updateProps`
    - **Then**: `options.getAll()` `["red", "green", "blue"]`, `currentId` `"green"`, `clearable` from props, `status` `"available"`
- Captions come from the attribute formatter
    - **When**: `caption.get("red")`, `caption.get(null)`
    - **Then**: `formatter.format("red")`, empty-option text
- Writes enumeration values
    - **When**: `setValue("blue")`, `setValue(null)`
    - **Then**: `attr.setValue("blue")`, `attr.setValue(undefined)`
- Boolean attribute maps to string options and is never clearable
    - **Given**: boolean attribute with universe `[true, false]`, value `true`, `clearable: true`
    - **Then**: `options.getAll()` `["true", "false"]`, `currentId` `"true"`, `clearable` false
- Writes boolean values
    - **When**: `setValue("false")`, `setValue("true")`
    - **Then**: `attr.setValue(false)`, `attr.setValue(true)`
- Prefers the enumeration attribute when both are defined
    - **Given**: both `attributeEnumeration` and `attributeBoolean` available
    - **Then**: options come from the enumeration universe
- Unavailable attribute or empty-option text
    - **Then**: `status` `"unavailable"`, `currentId` null, `clearable` true
- Read-only and validation pass through
- Filters by formatted caption
    - **Given**: `filterType: "startsWith"`, term `"gr"`
    - **Then**: `["green"]`

### Static (`StaticSingleSelector.spec.ts`)

- Options are the datasource indices
    - **Given**: three static entries
    - **Then**: `options.getAll()` `["0", "1", "2"]`, `caption.get("1")` is the entry caption
- Resolves `currentId` by value equality for string, Big, Date and boolean
    - **Given**: attribute value equal to the second entry in each type
    - **Then**: `currentId` `"1"`
- Writes the entry value and updates `currentId` synchronously
    - **When**: `setValue("2")`, `setValue(null)`
    - **Then**: `attr.setValue(entry2.value)` and `currentId` `"2"`; then `attr.setValue(undefined)` and `currentId` null
- Empty caption falls back to the attribute display value
    - **Given**: attribute with a display value
    - **When**: `caption.get(null)`
    - **Then**: the display value; with no display value, the empty-option text
- Boolean attribute is never clearable
- Reports `attributeType` `"boolean"` for a boolean universe, `"date"` for a datetime formatter, `"string"` otherwise
- Unavailable attribute, entry value, entry caption or empty-option text
    - **Then**: `status` `"unavailable"`, `currentId` null
- Filters by entry caption for all four filter types
- Quirk, preserved: keeps the previous `currentId` when the attribute value is cleared externally
    - **Given**: value matching entry 1, then `updateProps` with value `undefined`
    - **Then**: `currentId` stays `"1"`

### Database, multi (`DatabaseMultiSelectionSelector.spec.ts`)

- Exposes selected ids from the selection, optionally sorted by caption
- Writes known ids as `ObjectItem`s to the selection
    - **When**: `setValue([A, B])`
    - **Then**: `selection.setSelection([itemA, itemB])`
- Resolves an id that is in the selection but not in the loaded page
    - **Given**: selection contains C, datasource page does not
    - **When**: `setValue([C])`
    - **Then**: `setSelection([itemC])`
- Drops ids that are known nowhere and warns
    - **When**: `setValue(["nope"])`
    - **Then**: `setSelection([])`, `console.warn` called
- Row-click hides selected options; `isOptionsSelected` three-state; boxes forced for row click and custom content
- Keeps selection across datasource reloads
    - **Then**: `selection.setKeepSelection` called
- Unavailable datasource or empty-option text
    - **Then**: `status` `"unavailable"`, `currentId` null, `clearable` false

### Database, single (additions to `DatabaseSingleSelectionSelector.spec.ts`)

- Writes the value attribute and the selection
    - **When**: `setValue(A)`
    - **Then**: `targetAttribute.setValue("v1")`, `selection.setSelection(itemA)`, `currentId` A
- Clears both
    - **When**: `setValue(null)`
    - **Then**: `targetAttribute.setValue(undefined)`, `setSelection(undefined)`, `currentId` null
- Ignores updates while a non-lazy datasource is loading
    - **Given**: `ds.status` `"loading"`, `lazyLoading: false`
    - **When**: `updateProps`
    - **Then**: `status` stays `"unavailable"`, `setKeepSelection` not called
- Read-only follows `customEditability`
    - **Given**: `customEditability: "never"`
    - **Then**: `readOnly` true and `ds.setLimit(0)`

### Options provider filtering (`BaseOptionsProvider.spec.ts`)

- Each `filterType` against the same caption set, with `searchTerm` empty and non-empty, verifying both the set and the order (datasource order when empty, match-sorter ranking otherwise)
- `setSearchTerm` triggers the registered callback; registering again replaces it
- `hasMore` false, `isLoading` false, `status` `"available"`, `loadMore` no-op

### Limit arithmetic (`LazyLoadProvider.spec.ts`)

- `getLimit` table:
    - unavailable → 0
    - loading, not lazy → 0
    - loading, lazy, remembered limit 0 or Infinity → 0; remembered 50 → 50
    - available, read-only → 0
    - available, not lazy → undefined
    - available, lazy, requested 100 after remembered 100 → 100; requested 50 after remembered 100 → 100; requested 200 → 200 and remembered
- `setLimit` calls `ds.setLimit` only when the value differs from `ds.limit`

### Datasource filter (`datasourceFilter.spec.ts`)

- `"none"` or empty search → undefined
- `"contains"` and `"containsExact"` → `contains(attribute(id), literal(search))`
- `"startsWith"` → `startsWith(attribute(id), literal(search))`

### Hook seam (`useGetSelector.spec.tsx`, React)

- Returns the same selector instance across re-renders
- Calls `updateProps` with the latest props on every render
- Re-renders the host when the search term changes
    - **Given**: render counter
    - **When**: `act(() => selector.options.setSearchTerm("a"))`
    - **Then**: render count +1
- Quirk, preserved: `onFilterInputChange` is undefined on the first render and set from the second render on
- Debounces the filter-input action (fake timers)
    - **Given**: `onChangeFilterInputEvent` that can execute, interval 200
    - **When**: `onFilterInputChange("a")`, `onFilterInputChange("ab")`, advance 200 ms
    - **Then**: `execute` called once with `{ filterInput: "ab" }`
- Sends `undefined` for an empty term
- Skips the action when `canExecute` is false or `isExecuting` is true

## Notes

- Quirks pinned on purpose (see the tests marked `Quirk`): static selector keeps a stale `currentId` on external clear; `useGetSelector` only attaches `onFilterInputChange` from the second render; `isOptionsSelected` returns `"some"` when there are no options; `emptyOptionText: undefined` makes every family unavailable; a read-only control limits its datasource to zero items. Each is a candidate for a deliberate fix in its own change, never a silent one inside a refactoring.
- `caption.render` is tested lightly. It is a rendering concern and the component tests cover it with their snapshots.
- Preview providers (`helpers/*/Preview/`) stay untested here. They are exercised only by the editor preview, which keeps its own rendering.
- The datasource `setFilter` debounce and the filter-input action debounce are two separate timers with the same interval. Both are covered with fake timers.

### Quirk severity (rated 2026-10-28, none fixed in this change)

Real bugs, each to be fixed in its own change by flipping the pinned expectation and deleting the `// Quirk:` comment:

1. Static selector keeps a stale `currentId` on external clear. Medium. Same class as WC-3355 on the database selector. Needs a changelog line.
2. Chip sorting by caption is descending when the datasource has no sort order. Medium-low. Default `sortOrder` to `"asc"`.
3. Database multi never forces the boxes style for row click or custom content. Low. Changes rendering, so it needs a reviewed snapshot diff; check first whether the editor config already blocks the combination.

Not bugs: association `currentId` while unavailable (nothing renders in that state); missing `emptyOptionText` makes the selector unavailable (Studio Pro always supplies it); read-only limits the datasource to zero (deliberate); filter callback wired from the second render on (no practical effect).
