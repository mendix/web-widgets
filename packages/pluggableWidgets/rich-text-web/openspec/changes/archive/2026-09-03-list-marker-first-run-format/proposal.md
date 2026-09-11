## Why

When a user increases the font size of list item text, the bullet or number keeps rendering at the base size, because `::marker` inherits from the `<li>` while the font size lives on an inline `textStyle` span two levels down. The mismatch is visible on every enlarged list and there is no CSS path from a child span up to its ancestor `<li>`.

Word and Google Docs both resolve this by having the marker follow the formatting of the list item's **first text run**, which also gives a well-defined answer when the user formats only part of the item. This change adopts that rule.

## What Changes

- List markers (`<ol>` numbers and `<ul>` bullets) follow the format of the first inline run of their list item: **font size, font weight, font style, color, and font family**.
- Marker format is derived, never authored. There is no new toolbar control and no new user-facing property.
- Formatting only part of a list item affects the marker only when the formatting covers the **first character**. Formatting a later portion leaves the marker unchanged.
- The list's marker gutter grows when a list contains an enlarged marker, so large numbers and bullets are not clipped or overlapped by the item text.
- Marker format is carried in the saved HTML, so re-rendering stored content reproduces the markers.
- Task lists are explicitly out of scope: `taskItem` renders a checkbox with `list-style: none` and has no `::marker` to format.
- Not a breaking change. Content without marker formatting renders byte-identically to today.

## Capabilities

### New Capabilities

- `list-marker-format`: Deriving list marker format (size, weight, style, color, family) from the list item's first inline run, exposing it through the rendered HTML in both inline and class style modes, and scaling the list's marker gutter to fit an enlarged marker.

### Modified Capabilities

<!-- None. `list-margin-indent` requires that indent margin "stack with the list marker gutter
     rather than replacing it"; that requirement still holds once the gutter becomes dynamic,
     so no existing requirement text changes. Compatibility is asserted by a scenario in the
     new capability instead. -->

## Impact

**Affected code** (`packages/pluggableWidgets/rich-text-web`):

- New: a shared pure helper that computes marker format from a `listItem` node, plus a `ListItem` extension override and a ProseMirror plugin supplying view decorations.
- `src/components/Editor.tsx` — register the new extension and configure it with `styleDataFormat`.
- `src/ui/RichText.scss` — add `::marker` rules; make the `ol`/`ul` `padding-left` gutter dynamic (currently a hardcoded `1.5em`).
- `src/ui/RichTextFormatStyle.scss` — class-mode `attr()` mappings; the `ol.indent-N`/`ul.indent-N` rules repeat the same hardcoded `1.5em` gutter and need the same treatment.
- Ordered lists already run through `src/extensions/OrderedListStyled.ts`, so the ordered-list side of the gutter work has an existing home; bullet lists currently use StarterKit's `BulletList` unmodified and will need extending.

**Deliberately not affected:**

- The ProseMirror **document** is not mutated. Marker format is computed during rendering only. This avoids writing to every existing document on load, which would dirty forms and fire `onChange` microflows through the `onUpdate` → value → `setContent` reconciliation path in `Editor.tsx`.
- No change to `FontSize`, `TextColorClass`, `FontFamilyClass`, or the toolbar. Marker format reads the marks those extensions already produce.

**Known limitation to accept:** the saved HTML carries the marker format as data (custom properties or `data-*`), so rendering it outside the widget requires the widget stylesheet. Without it, markers fall back to base size — today's behavior. See `design.md` for why the fully self-contained alternative was rejected.

**Compatibility:** existing content gains correct markers on render with no migration and no document rewrite. Browser support rests on `::marker` accepting font properties, which is more broadly supported than the typed `attr()` the widget's class mode already ships.
