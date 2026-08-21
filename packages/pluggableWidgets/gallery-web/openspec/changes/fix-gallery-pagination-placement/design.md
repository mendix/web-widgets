# Design

## Context

Pagination in Gallery renders inside a three-slot flex bar. Both bars are built the same way, except the top bar has no middle slot:

```
.widget-gallery-footer-controls          display:flex; row nowrap
 ├─ .widget-gallery-fc-start             grow:1  basis:33.33%   selection counter
 ├─ .widget-gallery-fc-middle            (no flex rules today)  Load more button
 └─ .widget-gallery-fc-end               grow:1  basis:33.33%   pagination / custom pagination
                                         justify-content: flex-end

.widget-gallery-top-bar-controls
 ├─ .widget-gallery-tb-start             grow:1  basis:33.33%   selection counter
 └─ .widget-gallery-tb-end               grow:1  basis:33.33%   pagination
                                         justify-content: flex-end
```

The slot, not the bar, decides horizontal position. The old design property predates this structure: before the overhaul, `.widget-gallery-pagination` was a full-width row of its own directly under `.widget-gallery`, so justifying the bar inside it produced real left/centre alignment. That element is gone, which is why the property is inert.

Occupancy is dynamic:

| element           | slot        | condition                                                                                                                       |
| ----------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------- |
| selection counter | `*-start`   | `selectionCountPosition` matches the bar (defaults to `bottom`) **and** `selectedCount > 0`                                     |
| Load more button  | `fc-middle` | `pagination === "loadMore"` **and** `hasMoreItems`                                                                              |
| pagination bar    | `*-end`     | `paginationVisible` — see `Pagination.viewModel.ts`                                                                             |
| custom pagination | `fc-end`    | `useCustomPagination`; suppresses the built-in bar, since `paginationVisible` returns `false` for `paginationKind === "custom"` |

## Goals / Non-Goals

Goals

- Left / Center / Right alignment that is actually where it claims to be, in both bars.
- Visual order and focus order stay in agreement.
- One placement rule shared by runtime and editor preview so they cannot drift.
- Existing app configurations keep working without migration.

Non-Goals

- Pagination alignment for DataGrid 2 (no such property exists there; adding one is a feature).
- Fixing DataGrid 2's custom-pagination position bug, or its `-padding-top` container-query typo (own branch and PR — DataGrid 2 changes are kept out of a Gallery PR).
- E2E coverage for design properties (no test project currently loads the module CSS for Gallery).
- Replacing the design property with an XML widget property (cleaner long-term, but that makes WC-3505 a feature rather than a fix).

## Decisions

### Displacement, not wrapping

Pagination claims the slot its alignment names; whatever was there moves to the end slot.

```
align = Left, counter visible, buttons mode
┌─────────────────┬─────────────────┬─────────────────┐
│ [1-10 of 42 ◀▶] │                 │    3 selected   │
└─────────────────┴─────────────────┴─────────────────┘

align = Center, loadMore + total count + selection
┌─────────────────┬─────────────────┬─────────────────┐
│   3 selected    │   1-10 of 42    │  [ Load more ]  │
└─────────────────┴─────────────────┴─────────────────┘
```

The rule is total: at most three elements exist, there are three slots, and custom pagination replaces the built-in bar rather than adding to it. Since pagination claims exactly one slot, at most one element is ever displaced, so the end slot never has to hold two things.

The alternative considered was wrapping the bar onto a second full-width row when the claimed slot is occupied. Rejected: the selection counter appears dynamically at `selectedCount > 0`, so wrapping would add a row — and shift the page — the moment a user selects their first item. Displacement keeps the bar one row tall at all times.

### Placement computed by a pure function, not expressed in CSS

Four mechanisms were considered:

|                                   | TSX placement     | CSS `order`     | CSS grid areas | `margin: auto` |
| --------------------------------- | ----------------- | --------------- | -------------- | -------------- |
| DOM order matches visual          | yes               | no              | no             | no             |
| Focus / reading order correct     | yes               | no              | no             | no             |
| Needs to read the alignment value | yes               | no              | no             | no             |
| Release vehicle                   | widget + module   | module only     | module only    | module only    |
| Top bar Center                    | needs `tb-middle` | geometry rework | workable       | fiddly         |

The CSS mechanisms are cheaper — module-only release, no widget bump, no need to read the alignment at all — but every one of them reorders visually while leaving DOM order fixed. For a paging control that is a WCAG 2.4.3 (Focus Order) and 1.3.2 (Meaningful Sequence) defect: keyboard focus would jump right, then left, across the footer. TSX placement is chosen for that reason, and it also leaves the existing `< 500px` container queries untouched, since no new high-specificity selectors compete with them.

Placement logic is a pure function rather than inline JSX conditionals:

```
resolveSlots({ alignment, hasCounter, hasLoadMore, hasPagination })
  → { start:  "pagination" | "counter" | null,
      middle: "pagination" | "loadMore" | null,
      end:    "pagination" | "counter" | "loadMore" | null }
```

Algorithm: map alignment to a target slot; if pagination is visible, it takes that slot; then place each remaining element in its natural home (counter → start, Load more → middle) or, if that home is taken, in the end slot.

This keeps every alignment × occupancy combination testable without rendering, and lets the footer, the top bar and `Gallery.editorPreview.tsx` consume one shared result — the divergence that produced the custom-pagination bug below came precisely from those three places each deciding placement for themselves.

### Alignment is parsed from the design-property class

Design-property selections arrive as class names on the widget root. `props.class` is already piped through the props gate and surfaced by `GalleryRootViewModel.className`, so a MobX computed can parse it for `widget-gallery-pagination-(left|center|right)` and default to `right`. Because it is a computed over a string, Design-mode edits are reflected live and the parser is unit-testable on its own.

Trade-off accepted: three class names in `data-widgets`' `design-properties.json` become an input to `gallery-web`'s render logic. Renaming them would silently break layout. Mitigation is to treat them as a documented contract, asserted by unit tests on both sides of the parse.

The alternative — a new `pagingAlignment` XML enum — is better long-term design: typed, discoverable in the properties pane, no cross-package coupling. It was rejected for this change because it converts a bug fix into a feature, needs the existing design property deprecated with a migration story, and drops the Atlas-style ToggleButtonGroup affordance.

### Top bar gains a middle slot

Center is not expressible in a two-slot bar, so `widget-gallery-tb-middle` is added. It also makes the two bars structurally symmetric, so `resolveSlots` applies unchanged to both (the top bar simply never has a Load-more element).

### `Both` + custom pagination renders once, with an editor warning

Custom pagination is a `widgets` placeholder holding real widget instances. Rendering it in both bars would duplicate those instances, their DOM ids and their state, so `Both` renders once in the footer and `Gallery.editorConfig.ts` raises a `check()` warning explaining it. `Above grid` and `Below grid` are honoured exactly.

### Design property modernised rather than replaced

`Pagination` becomes a `ToggleButtonGroup` with `Atlas_Core.Atlas.align-left` / `align-center` / `align-right` icons — the form Atlas Core uses for every other alignment control — and gains an explicit `Right` option instead of relying on the implicit unset entry.

The property keeps its name, and so do the `Left` and `Center` options. Studio Pro stores a design property selection by **property name and option name**, not by CSS class, so renaming any of them orphans every existing selection. Verified in Studio Pro: renaming the property to "Pagination alignment" raised two errors on a page that already used it — `CE6083` "Design property Pagination is not supported by your theme" and `CE6087` "Design properties have been renamed in your theme and need to be updated". `oldNames` is honoured (Studio Pro offers "Update all renamed design properties in project"), but that is a migration the app developer has to run, and the app carries errors until they do. A bug-fix release should not impose that on every consumer, so the clearer label is left for a future deliberate revision of this property.

This is also why the class names cannot be renamed: they are the stored values, and they are simultaneously the contract the widget parses. Both halves of the property — names and classes — are frozen.

## Risks / Trade-offs

- **Focus order now varies with a styling-looking property.** `Left` places the paging controls before the Clear-selection button in the tab sequence. Accepted deliberately: the alternative is visual and focus order disagreeing.
- **Snapshot churn.** The new `tb-middle` node and slot reassignment change rendered DOM; component snapshots need regenerating and reviewing rather than blindly updating.
- **Cross-package class contract.** Covered above; mitigated by tests and documentation.
- **Centring depends on slot symmetry.** `fc-middle` is currently absent from the flex-sizing rules, so its centring is incidental — a counter long enough to hit min-content width skews it. The change gives the middle slots explicit sizing so Center holds by construction.
- **No automated regression guard for the CSS half.** Unit tests cover the placement map and the class parser; the rendered alignment itself is verified by manual Studio Pro QA. See the proposal for why E2E is impractical here.

## Open Questions

- ~~Whether the regenerated `tests/testProject/themesource/datawidgets/**` copy is committed alongside the source SCSS edit~~ — resolved: left to the module build. No previous commit touching `_gallery.scss` has updated that copy.
- Whether DataGrid 2's custom-pagination position bug is filed now or after this change lands.
