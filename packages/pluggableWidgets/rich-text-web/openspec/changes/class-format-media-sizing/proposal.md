## Why

After `class-format-table-sizing`, images, YouTube videos and generic embeds are the remaining elements whose size appears as inline `style` in the rendered widget when the style data format is `class`. Their node views write `width` / `height` styles on both the container and the media element, so a class-format widget still shows inline sizing in its DOM, inconsistent with tables and with what the format promises.

## What Changes

- In `class` format, the image, YouTube and generic-embed node views stop writing `width` / `height` as inline style. The size is carried by `data-width` / `data-height` on the node view container and applied by the widget stylesheet through typed `attr()`; the media element fills its container.
- The YouTube "unplayable source" placeholder follows the same rule.
- The three media extensions gain a `styleDataFormat` option, wired from the editor like the other format-aware extensions.
- The table wrapper no longer sets `position: relative` inline (the stylesheet already does).
- `inline` format rendering is unchanged.
- Saved HTML is unchanged in both formats: media sizes are already serialized as `width` / `height` HTML attributes with no inline style.
- Out of scope: the `white-space: normal` style on the node view wrapper, which is written by the tiptap `NodeViewWrapper` component.
- Accepted trade-off: because these node views also render in read-only mode, class-format media sizing in the widget becomes dependent on typed `attr()` (Chromium 133+), as table sizing already is. Videos and embeds keep their `width` / `height` attributes on the `<iframe>`, so they still size themselves elsewhere; images fall back to natural size.

## Capabilities

### New Capabilities

- `class-format-media-sizing`: how image, YouTube and generic-embed sizes are rendered in the widget (editor and read-only) when the style data format is `class`.

### Modified Capabilities

<!-- None. `rich-text-image-sizing` requires that a stored dimension renders at its size and that saved output uses HTML attributes; both still hold. This change only alters the mechanism that applies the size in class format. -->

## Impact

- `src/components/ImageResize.tsx`, `YouTubeResize.tsx`, `EmbedResize.tsx`: size carrier depends on format.
- `src/extensions/ImageResize.ts`, `YouTubeResize.ts`, `GenericEmbed.ts`: new `styleDataFormat` option.
- `src/components/Editor.tsx`: pass `styleDataFormat` to the three extensions.
- `src/extensions/TableBackgroundColor.ts`: drop the inline `position` on the wrapper.
- `src/ui/RichText.scss` / `RichTextFormatStyle.scss`: sizing rules for the media containers.
- Unit tests in `src/components/__tests__/`; `CHANGELOG.md`.
- No change to stored content, XML, typings or dependencies.
