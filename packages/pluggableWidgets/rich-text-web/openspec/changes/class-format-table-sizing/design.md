## Context

Table sizing is written in three places, and all three ignore `styleDataFormat` for size:

| Element   | Source                                                                  | Inline today                        | Data attribute today                  |
| --------- | ----------------------------------------------------------------------- | ----------------------------------- | ------------------------------------- |
| `<table>` | `TableBackgroundColor.ts` `renderHTML` and NodeView `updateTableStyles` | `width` / `min-width`, `min-height` | `data-width`, `data-min-height`       |
| `<col>`   | `TableBackgroundColor.ts` `createColGroup`                              | `width`                             | none                                  |
| `td`/`th` | `tableCellStyling.ts` `renderCellHTML`                                  | `width`, `height`                   | `data-cell-width`, `data-cell-height` |

No rule in `RichTextFormatStyle.scss` reads those data attributes, so today the inline style is the only thing sizing the table. `ImageResize.ts` already avoids `style` for the same CSP reason, by using HTML `width`/`height` attributes.

Two rendering paths exist for the table: the custom NodeView (editable + `resizable`, the default) and plain `renderHTML` (read-only widget and `editor.getHTML()`, i.e. what is stored). Cells and, in the read-only path, `<col>` elements go through ProseMirror's serializer, which sets `style` with `setAttribute`.

The border rule in the same stylesheet uses `attr(...) or <default>`. `or` is a Sass boolean operator; because `attr(...)` is truthy the right-hand side is discarded at compile time and the emitted CSS has no fallback.

## Goals / Non-Goals

**Goals:**

- Class-format output contains no inline sizing on `<table>`, `<col>`, `<td>`, `<th>`.
- Class-format sizing still renders, in the editor and in read-only mode, via the stylesheet.
- Existing class-format content keeps working without a migration step.
- Class-format border defaults match inline format.

**Non-Goals:**

- Firefox / Safari support for class-format sizing (see Risks).
- Changing inline-format output, the sizing UI, validation rules, or drag-resize behavior.
- Removing every `style` attribute from class-format output (list marker custom properties and other features are out of scope).
- Cascading a table-level border to inner cells.

## Decisions

### 1. Typed `attr()` in the stylesheet, not HTML presentational attributes

```scss
table[data-width] {
    width: attr(data-width type(<length-percentage>));
}
```

Alternative considered: HTML `width` / `height` attributes as `ImageResize.ts` does. Works in every browser, but supports px and % only and has no equivalent for `min-height` / `min-width`, while the size inputs accept any CSS length. Typed `attr()` covers every value the validator lets through and matches how colors, font size and borders already work in this file. Chosen by the product owner with the Chromium-only cost acknowledged.

### 2. Use `type(<length-percentage>)` for every sizing attribute

All six attributes use `<length-percentage>`: cell width and height explicitly allow `%`, and using one type everywhere avoids a per-attribute table to maintain. No fallback argument: when the attribute is missing the rule does not match (attribute selector), and when the value cannot be parsed the property falls back to `auto`, which is the correct "unsized" result.

Values keep their unit in the attribute (`"250px"`), unlike `data-font-size` which stores a bare number. This is why the border width bug existed (`attr(data-border-width px)` against `"4px"`); sizing must not repeat it.

### 3. Selector shape: attribute selectors scoped under `.widget-rich-text`

Rules are `table[data-width]`, `table[data-min-width]`, `table[data-min-height]`, `col[data-col-width]`, `td[data-cell-width], th[data-cell-width]`, `td[data-cell-height], th[data-cell-height]`. No `has-*` marker classes: the attribute is the marker, and existing saved content already has these attributes without any class. Element-qualified selectors keep specificity at or above the base rules in `TableStyle.scss` (`.widget-rich-text table td`), which set `min-width: 1em` but no `width`/`height`, so there is no conflict to win.

### 4. Two new attributes; derived fixed width reuses `data-width`

- `data-col-width` on `<col>`: under `table-layout: fixed` the `<col>` governs the column, so it needs its own carrier. It is output-only: on parse, column widths are still read from the first-row cells (`data-cell-width` / `colwidth`), exactly as today. `<colgroup>` is regenerated from the node, never parsed.
- `data-min-width` on `<table>`: the column-derived minimum width (emitted when a column is unsized or percentage). Output-only for the same reason.
- The column-derived fixed width (all columns in px) is written to `data-width`, since it maps to the same CSS property as an explicit width and explicit already wins when both exist.

Consequence to handle: `width.parseHTML` reads `data-width` in class mode, so a derived width would be read back as an explicit one after a save/reload round trip, freezing the table width when columns later change. To prevent this, the derived value is marked (`data-width-derived="true"`, or equivalent) and `parseHTML` returns `null` for a marked value. Alternative considered: a separate `data-derived-width` attribute with its own CSS rule; rejected because two rules would compete for `width` and need an ordering guarantee.

### 5. Branch on format where the style string is built

`createColGroup` gains the format (or returns raw widths and lets callers decide the carrier). The three style builders (`renderHTML`, `updateTableStyles`, `renderCellHTML`) push size segments only in inline mode; class mode adds to the existing `classAttrs` / `setAttribute` blocks. `updateTableStyles` must also remove `data-min-width` / derived `data-width` when they no longer apply, mirroring how it already removes `data-width` and `data-min-height`.

### 6. NodeView keeps CSSOM writes for live drag only

`startResize` writes `table.style.width` / `minHeight` on every mouse move. These are CSSOM writes, which CSP `style-src` does not restrict, and they are transient. On mouse up `commitSize` dispatches a transaction; `updateTableStyles` then resets `cssText` (empty in class mode) and sets the data attribute, so the stylesheet takes over at the same size. No change to the drag code itself.

Column resizing by dragging a column edge (prosemirror-tables) also writes `col.style.width` through the CSSOM while dragging; the same reasoning applies. Whether that plugin is active alongside the custom NodeView is to be confirmed during implementation.

### 7. Border fallbacks as CSS, not Sass

```scss
border-width: attr(data-border-width type(<length>), 1px);
border-style: attr(data-border-style type(<custom-ident>), solid);
border-color: attr(data-border-color type(<color>), var(--color-neutral-300, #d9d9d9));
```

`<custom-ident>` replaces `type(*)` for the style keyword: the value is already restricted to the border-style allowlist on output, and a narrower type cannot substitute arbitrary tokens. Defaults mirror `buildBorderStyleSegments` in `tableStyle.ts`.

## Risks / Trade-offs

- [Class-format table sizing stops working in Firefox and Safari, where it works today through inline style] → Accepted. Class format already depends on typed `attr()` for colors, font size and borders there; inline is the recommended format. State it in the changelog entry.
- [Size values the validator accepts but `<length-percentage>` rejects, e.g. `auto`, `max-content`, `fit-content` (`isSafeCssSize` defers to `CSS.supports("width", …)`)] → Property falls back to `auto`; table renders unsized instead of broken. Covered by a unit test that documents the behavior; tightening the validator is out of scope.
- [Derived `data-width` read back as explicit width] → Marker attribute and `parseHTML` guard (Decision 4), with a round-trip unit test.
- [Legacy class-format content shown read-only is never re-saved] → Still correct: its inline style keeps sizing it, and the new rules resolve to the same values.
- [Jest/jsdom cannot evaluate typed `attr()`] → Unit tests assert serialized attributes and absence of inline sizing; rendered size is verified manually in Chromium and by e2e screenshot if a class-format table page exists in the test project.
- [Border defaults change visible output for existing class-format content: a table with only a border color goes from no border to `1px solid`, and unset width goes from 3px to 1px] → This is the intended, inline-matching result; noted in the changelog.

## Migration Plan

No data migration. Old content loads through the existing `parseHTML` (data attributes preferred) and is normalized on next save. Rollback is a plain revert: content saved by the new version has data attributes only, so after a revert it would render unsized until re-saved by the old version's editor (which re-adds inline style on any edit).

## Open Questions

Resolved during implementation:

- **Column-resize plugin.** Active: `Table.addProseMirrorPlugins` registers prosemirror-tables `columnResizing` whenever `resizable && isEditable`, alongside the custom NodeView. While dragging, `updateColumnsOnResize` writes `col.style.width` and `table.style.width` / `minWidth` through the CSSOM. On release it commits `colwidth`, the NodeView `update` runs, `updateColgroup` rebuilds the `<col>` elements and `updateTableStyles` resets `cssText`, so nothing inline survives in class format. No code change needed.
- **E2E coverage.** The test project has a class-format page (`/p/classmode`) containing a sized table, covered by the `classModeEditor.png` screenshot. No new e2e test added; that screenshot acts as the regression check and must be re-run (and the baseline refreshed if the border defaults shift pixels).
