## 1. Placement map (`resolveZones`)

- [x] 1.1 Add a `resolveZones({ alignment, hasCounter, hasLoadMore, hasPagination })` pure function returning `{ start, middle, end }` with occupant tokens (`"pagination" | "counter" | "loadMore" | null`).
- [x] 1.2 Implement the rule: alignment names the pagination target zone; pagination takes it if visible; remaining occupants go to their natural home (counter → start, Load more → middle) or to the end zone if that home is taken.
- [x] 1.3 Unit-test every alignment × occupancy combination, including `hasPagination: false` (no zone reserved) and the three-occupant case.
- [x] 1.4 Assert in tests that the end zone is never assigned two occupants, documenting why that is structurally impossible.

## 2. Alignment source (design-property class)

- [x] 2.1 Add a parser for `widget-gallery-pagination-(left|center|right)` over the root class string, defaulting to `right`.
- [x] 2.2 Expose it as a MobX computed reading `props.class` through the existing props gate (alongside `GalleryRootViewModel.className`) so Design-mode edits apply without remount.
- [x] 2.3 Unit-test: each class recognised; unrelated classes ignored; no class → `right`; multiple alignment classes resolved deterministically.
- [x] 2.4 Add a comment naming the three class names as a contract shared with `data-widgets/design-properties.json`.

## 3. Bar components

- [x] 3.1 Render `GalleryFooterControls` occupants from the `resolveZones` result instead of fixed per-zone JSX.
- [x] 3.2 Add a `widget-gallery-tb-middle` zone to `GalleryTopBarControls` and render its occupants from the same result.
- [x] 3.3 Route custom pagination through the placement map as the pagination occupant, so alignment moves it too.
- [x] 3.4 Regenerate and review affected component snapshots (new `tb-middle` node, zone reassignment) — review, do not blind-update. (No snapshot updates needed: the only committed snapshot covers `GalleryRoot`, which renders neither bar.)

## 4. Custom pagination position

- [x] 4.1 Honour `pagingPosition` for custom pagination at runtime: `top` → top bar, `bottom` → footer.
- [x] 4.2 For `both`, render custom pagination once in the footer.
- [x] 4.3 Add a `check()` warning in `Gallery.editorConfig.ts` for custom pagination + `both`, explaining the widgets render below the gallery.
- [x] 4.4 Unit-test placement for `top` / `bottom` / `both` with custom pagination enabled.

## 5. Editor preview parity

- [x] 5.1 Drive `Gallery.editorPreview.tsx` placement from `resolveZones`.
- [x] 5.2 Align preview custom pagination with runtime, including the single-render rule for `both`.
- [x] 5.3 Add the `tb-middle` zone to the preview markup so preview and runtime DOM match.

## 6. Theme changes (`packages/modules/data-widgets`)

- [x] 6.1 `design-properties.json`: convert Gallery `Pagination` to `ToggleButtonGroup` with `Atlas_Core.Atlas.align-left` / `align-center` / `align-right` icons; add an explicit `Right` option mapping to `widget-gallery-pagination-right`; keep existing class names; add `oldNames` for any renamed property/option label.
- [x] 6.2 `_gallery-design-properties.scss`: delete the dead `.widget-gallery-pagination-left` / `-center` rule blocks that target the removed wrapper; add the `-right` class.
- [x] 6.3 `_gallery.scss`: give `fc-middle` / `tb-middle` explicit `display: flex`, `justify-content: center` and flex sizing so Center is centred by construction; add `flex-shrink: 0` where needed to keep zones symmetric.
- [x] 6.4 Verify the `< 500px` container queries still win over the new selectors (bar stacks to a column and centres everything at narrow widths).
- [x] 6.5 Decide and act on whether the build-regenerated `tests/testProject/themesource/datawidgets/**` copy is committed with the source edit. (Left to the module build — no prior commit touching `_gallery.scss` has updated that copy.)

## 7. Manual QA (Studio Pro)

- [ ] 7.1 Build Gallery + DataWidgets into a test project; verify Left / Center / Right for `pagingPosition` = `bottom`, `top`, `both`.
- [ ] 7.2 Verify each alignment with the selection counter visible (`selectionCountPosition` = `bottom`, then `top`) and confirm displacement, single-row height, and no shift when the first item is selected.
- [ ] 7.3 Verify Center with Load more + Show total count (all three occupants).
- [ ] 7.4 Verify custom pagination for `Above grid`, `Below grid`, `Both`, and the design-time warning.
- [ ] 7.5 Verify narrow-width behaviour (< 500px container) still stacks and centres regardless of alignment.
- [ ] 7.6 Verify Design-mode preview matches runtime for a sample of the above.
- [ ] 7.7 Tab through both bars for each alignment and confirm focus order follows visual order.

## 8. Release hygiene

- [x] 8.1 `gallery-web/CHANGELOG.md`: pagination alignment works again; custom pagination respects its position setting.
- [x] 8.2 `data-widgets/CHANGELOG.md`: pagination alignment design property reworked (with `Right`).
- [x] 8.3 Confirm lint/test pass for `gallery-web`; confirm no shared-package changes crept in. (145 tests pass, `tsc --noEmit` clean, eslint 0 errors in changed files; no `packages/shared` edits.)
- [x] 8.4 Confirm no breaking change: existing apps using the old design-property classes keep working.
- [ ] 8.5 File follow-up tickets for DataGrid 2: the custom-pagination position bug, and the `-padding-top` container-query typo (both out of scope here, shipped separately).
