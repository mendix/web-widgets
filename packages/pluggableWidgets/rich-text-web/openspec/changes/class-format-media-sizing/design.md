## Context

Media sizing differs from the table case solved in `class-format-table-sizing`:

- **Saved HTML is already clean.** `ImageResize.ts` serializes `width` / `height` HTML attributes; the tiptap `Youtube` extension and `GenericEmbed.ts` put `width` / `height` on the `<iframe>`. No inline style in either format, and `rich-text-image-sizing` requires this.
- **The inline style lives only in the rendered widget.** The React node views (`ImageResize.tsx`, `YouTubeResize.tsx`, `EmbedResize.tsx`) pass `style={{ width, height }}` to the container and to the media element. `addNodeView` is unconditional, so the same components render in read-only mode.
- These are CSSOM writes by React, so they do not violate a `style-src` policy. The motivation here is consistency of the class-format DOM, not a CSP failure.
- None of the three extensions knows the format today; `Editor.tsx` passes `styleDataFormat` only to the text and table extensions.

Current DOM (class format):

```
.image-container   style="width: 437px; height: 554px"
  img              style="width: 437px; height: 554px"
.youtube-container style="width: 560px; height: 314px"
  iframe           width="560" height="314" style="width: 560px; height: 314px"
```

## Goals / Non-Goals

**Goals:**

- In class format, no `width` / `height` inline style on media containers, `<img>` or `<iframe>`, including while dragging.
- Same rendered size as today in a browser supporting typed `attr()`.
- Inline format and saved HTML untouched.

**Non-Goals:**

- Removing `style="white-space: normal"` from the node view wrapper (hard-coded in tiptap's `NodeViewWrapper`).
- A class-format DOM with no `style` attribute at all.
- Changing what is stored or serialized, the resize interaction, or size limits.
- Firefox / Safari parity for class-format image size in the widget.

## Decisions

### 1. One carrier on the container; media element receives the same value

```
.image-container data-width="437px" data-height="554px"
  img            (no style)
```

```scss
.image-container[data-width] {
    --rt-media-width: attr(data-width type(<length-percentage>));
    width: var(--rt-media-width);
    > img {
        width: var(--rt-media-width);
    }
}
// same for data-height / --rt-media-height
```

`attr()` only reads the element's own attributes, so the container publishes the value as an inherited custom property and the media element consumes it. This reproduces today's inline behavior exactly (container and media element both get the same declared value), where an earlier draft had the media element fill the container at `100%`, which would have changed how percentage widths and clamped images render.

Same pattern for `.youtube-container` / `.embed-container` with `> iframe`, and for `.youtube-unplayable` (which is its own box, so it takes the size rules directly).

Alternatives considered:

- _`width` / `height` attributes on `<img>` only._ The existing rule `.image-container img { height: auto }` overrides a height attribute, attributes cannot express `em` values that `toCssLength` passes through, and the container still needs a size for percentage widths and for anchoring the resize handles.
- _Data attributes on both container and media element._ Two carriers for one value; the element would also apply a percentage a second time relative to the already-sized container.

### 2. Values keep their unit

`data-width` holds exactly what the inline style holds today: `toCssLength(...)` for images (so v4 bare numbers become `px`), `` `${n}px` `` for videos and embeds. Read with `type(<length-percentage>)`. An image dimension of `auto` (no stored size) emits no attribute, so the attribute selector does not match and the image keeps its natural size.

### 3. Format reaches the component through an extension option

Add `styleDataFormat: "inline" | "class"` (default `"inline"`) to `ImageResize`, `YouTubeResize` and `GenericEmbed`, set from `Editor.tsx`. Components read `props.extension.options.styleDataFormat`, as `YouTubeResize.tsx` already reads other options.

Alternative considered: drop the inline style in both formats. Rejected because it would make inline-format media sizing depend on typed `attr()`, a regression for the recommended format.

A small shared helper returns the props for a sized box, so the three components do not each repeat the branch:

```
sizeProps(format, width, height) →
  inline: { style: { width, height } }
  class:  { "data-width": width, "data-height": height }   // omitting "auto" / undefined
```

In class format the media element receives no size props (the `<iframe>` keeps its `width` / `height` attributes as today).

### 4. Rules live where they win on specificity

The existing media rules are deeply nested in `RichText.scss` (e.g. `… .image-wrapper .image-container img { height: auto }`), and `RichTextFormatStyle.scss` is hoisted above them by `@use`. The new rules therefore go next to the existing container rules in `RichText.scss`, where the attribute selector adds specificity on top of the same nesting. `RichTextFormatStyle.scss` stays the home for rules that apply to saved-content markup; these containers exist only in node views.

### 5. Live drag updates the data attribute

During a drag the components already keep the size in React state and re-render per mouse move. In class format that state feeds `data-width` / `data-height` instead of `style`; the commit on mouse up is unchanged. No direct DOM writes are added.

### 6. Table wrapper position

`TableBackgroundColorNodeView` sets `this.dom.style.position = "relative"`, while `TableStyle.scss` already declares `.tableWrapper { position: relative }`. The inline write is removed in both formats.

## Risks / Trade-offs

- [Class-format image size is lost in read-only widgets on Firefox / Safari, where it works today] → Accepted, same trade-off as table sizing; inline remains the recommended format. Videos and embeds are unaffected because the `<iframe>` keeps its size attributes. Stated in the changelog.
- [Percentage widths and images wider than the editor] → Avoided by Decision 1: container and media element get the same declared value as with inline style today, so both cases render as they do now. Still listed for manual verification.
- [jsdom cannot evaluate typed `attr()`] → Unit tests assert attributes and absence of inline sizing; rendered size is checked manually and through the existing class-mode e2e screenshot if it contains media.
- [Per-frame attribute updates during drag trigger style recalculation] → Same cost class as the current per-frame inline style update.

## Migration Plan

None. No stored data changes. Rollback is a plain revert.

## Open Questions

Resolved during implementation:

- **E2E coverage.** The class-mode e2e page (`/p/classmode`, `classModeEditor.png`) contains a table, a list and a link, but no image or video. No e2e test added; media sizing is verified manually.
