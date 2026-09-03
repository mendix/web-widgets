## Why

Images sized in Rich Text v4 lose their size when the content is opened in v5. They render at natural size in both the editor and the read-only view, so existing app content visibly changes on upgrade — a 300px thumbnail becomes a full-bleed photo.

The stored data is not lost. v4 wrote the size as unitless HTML attributes, because the Quill resize module was configured with `attribute: ["width", "height"]` and no unit (`src/utils/modules/resize.ts` before the TipTap rewrite: `if (limit.unit) { res.width = width + "px" } else { res.width = width }`). So v4 content is `<img src="…" width="300" height="200">`, and `ImageResize.ts` already parses those attributes into the node's `width`/`height` attributes as `"300"` / `"200"`.

The break is in the node view. `src/components/ImageResize.tsx` feeds the attribute value straight into CSS:

```tsx
<div className="image-container" style={{ width: size.width, height: size.height }}>
    <img style={{ width: size.width, height: size.height }} />
```

`width: 300` is not valid CSS, so React drops the declaration. The node view never sets the `width`/`height` HTML attributes on its `<img>` either, so nothing constrains the image and it renders at natural size. v5's own values carry a unit (`"300px"`, written by the image dialog's `toPixelValue` and by the resize handles) and therefore work. Read-only mode uses the same node view, so both edit and read panel are affected.

Verified round-trip in the current code:

| Input HTML                            | node attrs        | `getHTML()`                |
| ------------------------------------- | ----------------- | -------------------------- |
| `<img width="300" height="200">` (v4) | `"300"` / `"200"` | `width="300" height="200"` |
| `<img width="300px">` (v5)            | `"300px"`         | `width="300px"`            |
| `<img style="width:300px">`           | `"300px"`         | `width="300px"`            |

The third row is the second, smaller problem: `<img width>` is defined as a valid non-negative integer, so `width="300px"` is invalid HTML. Browsers apply the legacy "rules for parsing dimension values" and land on 300, so it renders correctly today, but it means v4 and v5 write two different formats for the same thing and v5's output is not spec-valid.

## What Changes

- New `src/utils/imageSize.ts` with two conversions: a stored dimension to a CSS length (unitless `300` becomes `300px`), and a stored dimension to a valid HTML dimension attribute value (`300px` becomes `300`).
- `src/components/ImageResize.tsx` applies the CSS conversion wherever it puts a dimension into `style`, so v4 unitless values render at their stored size.
- `src/extensions/ImageResize.ts` `renderHTML` emits the HTML-attribute conversion, so serialized images use one spec-valid format regardless of which version wrote them. v4 content that is loaded and saved untouched serializes byte-identically to its input.
- Image dimensions stay in `width`/`height` **attributes**, not inline `style`. Attributes survive a strict CSP, which is the point of the existing `styleDataFormat: "class"` mode.
- No data migration, no new widget properties, no new translation keys, no change to the image dialog or to the resize interaction.

## Capabilities

### New Capabilities

- `rich-text-image-sizing`: how an image node's stored `width`/`height` are interpreted when rendering and how they are serialized back to HTML, including v4 unitless attribute values.

### Modified Capabilities

<!-- No existing spec requirement changes. `rich-text-image-dialog` is unchanged: the dialog still
applies its Width/Height inputs as pixel strings on the node, and this change only affects how a
stored dimension is turned into CSS and into serialized HTML. -->

## Impact

- Affected code: `src/utils/imageSize.ts` (new), `src/components/ImageResize.tsx`, `src/extensions/ImageResize.ts`.
- User-facing: images sized in v4 keep that size after upgrading to v5, in edit and read-only mode. Serialized `width`/`height` values lose the `px` suffix v5 was writing; rendering is unaffected, since browsers parsed both to the same number.
- Not affected: videos and embeds. `GenericEmbed` and `YouTubeResize` store dimensions as numbers, and React appends `px` to numeric style values, so they never hit this bug.
- Testing: unit tests for the two conversions, parse/serialize round-trip tests for v4 unitless, v5 pixel-string, and inline-style input, and a node view render test asserting the applied inline style.
