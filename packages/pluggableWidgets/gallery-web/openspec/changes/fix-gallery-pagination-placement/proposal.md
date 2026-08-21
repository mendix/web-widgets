## Why

Gallery's `Pagination` design property (Left / Center) has silently done nothing since the pagination overhaul. The property's CSS keys off a `.widget-gallery-pagination` wrapper element that the overhaul deleted; the only remaining references to `widget-gallery-pagination-left` / `-center` are the two dead rule blocks in `_gallery-design-properties.scss` and their `class` entries in `design-properties.json`. Nothing renders or reads them, so pagination is always right-aligned in both the top bar and the footer, in every configuration (WC-3505, reported against Mendix 11.12.0 / DataWidgets 3.11.2).

Restoring the property is not a CSS change. Pagination now lives inside a three-slot flex bar (`*-start` / `*-middle` / `*-end`) where the slot, not the bar, determines position — and the slots are already occupied by the selection counter and the Load-more button. Aligning by overriding `justify-content` inside the end slot would centre pagination at ~83% of the bar width, not 50%. Aligning by CSS `order` or grid placement would move pagination visually while leaving DOM order fixed, breaking keyboard focus order (WCAG 2.4.3) and reading sequence (WCAG 1.3.2) for a paging control.

Two further defects surfaced while investigating, both in Gallery's pagination placement and both folded in here:

- Custom pagination ignores `Position of pagination` at runtime. `GalleryFooterControls` renders custom pagination widgets whenever custom pagination is enabled, with no position check, and `GalleryTopBarControls` never renders them at all. Setting `Above grid` still renders the widgets below the gallery, so a visible property silently does nothing.
- Editor preview disagrees with runtime on that same setting. `Gallery.editorPreview.tsx` does honour position for custom pagination, so Studio Pro's page editor shows the widgets above the gallery while the running app shows them below.

## What Changes

- **Slot placement becomes explicit and data-driven.** A pure `resolveSlots({ alignment, hasCounter, hasLoadMore, hasPagination })` function returns which element renders in each slot. Pagination claims the slot its alignment names; whatever occupied that slot is displaced to the end slot. `fc-end` is always the displacement target, which makes the rule total — element count never exceeds slot count, because custom pagination replaces the built-in bar rather than adding to it.

    | alignment | pagination slot | displaced to end slot | untouched                     |
    | --------- | --------------- | --------------------- | ----------------------------- |
    | Left      | `*-start`       | selection counter     | Load more stays in `*-middle` |
    | Center    | `*-middle`      | Load more button      | counter stays in `*-start`    |
    | Right     | `*-end`         | nothing               | everything                    |

- **Both bars honour alignment.** The top bar gets a `widget-gallery-tb-middle` slot so Center is expressible there; today it has only `tb-start` and `tb-end`. The same `resolveSlots` result drives the footer, the top bar, and the editor preview, so the three cannot drift apart.
- **Alignment is read from the design-property class.** `props.class` already reaches the widget through the props gate and is exposed on `GalleryRootViewModel`. A computed parses it for `widget-gallery-pagination-(left|center|right)`, defaulting to `right`. Being a MobX computed over a plain string, it reacts live to Design-mode edits and is unit-testable in isolation. The three class names become a documented contract between `data-widgets`' theme JSON and `gallery-web`'s render logic.
- **The design property is modernised** (`data-widgets`): `Pagination` becomes a `ToggleButtonGroup` carrying the `Atlas_Core.Atlas.align-left` / `align-center` / `align-right` icons, matching how Atlas Core expresses every other alignment control, and gains an explicit `Right` option instead of relying on the unset entry. The property name and the existing option names are kept exactly as they are. Studio Pro stores design property selections by **property and option name**, not by class, so renaming any of them raises `CE6083` ("not supported by your theme") and `CE6087` ("renamed in your theme and need to be updated") in every existing app until the developer runs "Update all renamed design properties in project". A bug-fix release must not impose that migration, so the clearer label "Pagination alignment" is deliberately not used.
- **Dead CSS is removed and the middle slot is made real** (`data-widgets`): the two `.widget-gallery-pagination` rule blocks go; `fc-middle` / `tb-middle` get explicit `display: flex`, `justify-content: center` and flex sizing so Center is centred by construction rather than incidentally (today `fc-middle` is absent from both slot rules, unlike DataGrid 2's `pb-middle`, so its centring depends on the start and end slots staying symmetric). The new selectors must not outrank the `< 500px` container queries that stack the bar into a column and centre everything.
- **Custom pagination honours `Position of pagination`.** `Above grid` renders the widgets in the top bar, `Below grid` in the footer. `Both` renders them once in the footer — duplicating a `widgets` placeholder would duplicate widget instances, DOM ids and state — and `Gallery.editorConfig.ts` gains a `check()` warning explaining that. Editor preview is brought in line with runtime.
- **Accessibility consequence, intended and specified:** DOM order stays `start → middle → end`, so alignment now also determines tab and screen-reader order. `Left` puts the paging controls before the Clear-selection button. This is the correct trade — visual and focus order stay in agreement, which the CSS-only alternatives could not achieve.

Out of scope, deliberately:

- **DataGrid 2 pagination alignment.** DataGrid 2 has no such design property; adding one is a feature, not this fix.
- **The DataGrid 2 container-query typo.** `_datagrid.scss`'s top-bar container query targets `#{$root}-padding-top` instead of `-paging-top`, so DataGrid 2's narrow-width top-bar stacking has never applied. A one-word fix, but a DataGrid 2 change: it ships on its own branch and PR so Gallery and DataGrid 2 changes stay reviewable separately.
- **DataGrid 2's custom-pagination position bug.** `WidgetFooter` / `WidgetTopBar` ignore `pagingPosition` for custom pagination exactly as Gallery does, but DataGrid 2's preview agrees with its runtime, so there is no preview divergence there. Needs its own ticket.
- **E2E coverage.** `gallery-web`'s test project ships a fossil `themesource/datagrid/` module theme containing zero `widget-gallery` rules and no `datawidgets` themesource at all, so Gallery E2E currently runs with none of the module CSS loaded — an alignment assertion there would assert nothing. `packages/modules/data-widgets` has no `e2e/` directory. Covering this properly means wiring datawidgets themesource into a test project or standing up E2E in the module, both larger than the fix. Verified by unit tests plus manual Studio Pro QA instead.

## Capabilities

### New Capabilities

- `gallery-pagination-placement`: which bar slot the pagination control renders in, derived from the pagination-alignment design property, including displacement of the selection counter and Load-more button out of the claimed slot, symmetry between top bar and footer, and the resulting DOM/focus order.
- `gallery-custom-pagination-position`: where custom pagination widgets render relative to the gallery, honouring `Position of pagination`, including the single-render rule for `Both` and the editor-time warning that accompanies it.

### Modified Capabilities

_None — `openspec/specs/` currently documents no Gallery pagination or bar-layout capability, so both are captured as new capabilities rather than deltas._

## Impact

`packages/pluggableWidgets/gallery-web`

- `src/components/GalleryFooterControls.tsx`, `src/components/GalleryTopBarControls.tsx` — render elements from the `resolveSlots` map; top bar gains a middle slot.
- new `resolveSlots` module (placement alongside the other view-model/config code) + unit tests covering every alignment × element combination.
- `src/view-models/GalleryRoot.viewModel.ts` (or a dedicated computed) — expose `pagingAlignment` parsed from `props.class`, defaulting to `right`; unit tests for the parser including unknown/multiple classes.
- `src/Gallery.editorPreview.tsx` — same placement map; custom pagination brought in line with runtime.
- `src/Gallery.editorConfig.ts` — `check()` warning for `Both` + custom pagination.
- `src/components/__tests__/` snapshots — DOM changes from the new `tb-middle` node and from slot reassignment.
- `CHANGELOG.md` — user-facing entries: pagination alignment works again; custom pagination respects its position setting.

`packages/modules/data-widgets`

- `src/themesource/datawidgets/web/design-properties.json` — `ToggleButtonGroup` + icons, explicit `Right`, `oldNames` for renames.
- `src/themesource/datawidgets/web/_gallery-design-properties.scss` — drop the dead `.widget-gallery-pagination` blocks, add the `-right` class.
- `src/themesource/datawidgets/web/_gallery.scss` — real `fc-middle` / `tb-middle` slots; verify the `< 500px` container queries still win.
- `tests/testProject/themesource/datawidgets/web/*` — regenerated by the module build (`copyThemesourceToProject` copies `src/themesource` into the target project, which defaults to `tests/testProject`); decide whether the regenerated copy is committed with the source edit. The frozen copies in `datagrid-dropdown-filter-web` and `rich-text-web` test projects are not regenerated by their own builds and are left alone.
- `CHANGELOG.md` — Gallery pagination alignment entries only; the DataGrid 2 fix is changelogged on its own branch.

Cross-cutting

- No shared-package changes (`widget-plugin-grid`'s `Pagination` component and view model are untouched).
- No breaking changes: design-property class names are preserved, so existing app configurations keep working. Adding `Right` and renaming labels via `oldNames` is additive.
- Release vehicle: `gallery-web` markup change plus a `data-widgets` module release. Versions bumped at release time, changelog entries added with the implementation.
