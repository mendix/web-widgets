## Context

Three places touch an image node's dimensions today:

1. `src/extensions/ImageResize.ts` — `parseHTML` reads the `width`/`height` HTML attribute, falling back to `element.style.width` / `element.style.height`; `renderHTML` writes the stored value back as a `width`/`height` HTML attribute, verbatim.
2. `src/components/ImageResize.tsx` — the node view. Seeds local `size` state from `node.attrs.width || "auto"`, puts `size` into the `style` of both `.image-container` and the `<img>`, and on drag-end writes `${Math.round(px)}px` back through `updateAttributes`.
3. `src/components/toolbars/components/ImageDialog.tsx` — `toPixelValue` turns the Width/Height inputs into `"300px"` before `setImage`.

So the stored attribute is a **CSS length string** everywhere in v5, and a **bare number** in v4 content. Only (2) is broken for v4, because a bare number is not a CSS length.

Value shapes that can reach the node attribute:

| Origin                                         | Stored value |
| ---------------------------------------------- | ------------ |
| v4 resize / v4 dialog                          | `"300"`      |
| v5 dialog (`toPixelValue`)                     | `"300px"`    |
| v5 resize handles                              | `"300px"`    |
| pasted external HTML with `style="width:50%"`  | `"50%"`      |
| pasted external HTML with `style="width:20em"` | `"20em"`     |
| no size                                        | `null`       |

## Goals / Non-Goals

Goals:

- A v4-sized image renders at its stored size in v5, in the editor and in read-only mode.
- One serialized format for image dimensions, valid per HTML.
- No rewrite of existing content beyond what a normal save already does.

Non-Goals:

- Migrating stored data in bulk, or touching the attribute at parse time. Parsing stays as-is so a load-without-edit round-trip cannot alter customer data.
- Moving image dimensions to inline `style`. Rejected: a `style` attribute needs `style-src 'unsafe-inline'`, and the widget's `styleDataFormat: "class"` mode exists precisely to support strict CSP. `width`/`height` attributes are CSP-safe and are what both v4 and the HTML spec use for images.
- Changing the image dialog, its Width/Height inputs, or the resize interaction.
- Videos and embeds. `GenericEmbed` parses its dimensions with `parseInt` and stores numbers, and React appends `px` to numeric style values, so they are unaffected.

## Decisions

### Normalize at the boundaries, not in the stored attribute

Two conversions live in `src/utils/imageSize.ts`:

```ts
/** Stored dimension to a CSS length. v4 wrote bare numbers, which are invalid CSS. */
toCssLength(value): string | undefined
/** Stored dimension to a valid HTML width/height attribute value. */
toHtmlDimension(value): string | undefined
```

`toCssLength`: `null`/`""`/`undefined` → `undefined`; digits only (`"300"`, `"300.5"`) → `"300px"`; anything else (`"300px"`, `"50%"`, `"20em"`, `"auto"`) → unchanged.

`toHtmlDimension`: `null`/`""`/`undefined` → `undefined`; digits only → unchanged; digits + `px` → digits; `%` → unchanged (browsers legacy-parse a percentage dimension attribute, and dropping it would silently resize the image); any other unit or keyword → `undefined`, because the attribute cannot express it and a bogus attribute value is worse than none.

Alternative considered: normalize in `parseHTML` (`"300"` → `"300px"`). Rejected — it rewrites v4 content on the first save even when the user changed nothing else, and it puts the compatibility shim in the one place that also runs for every paste.

### The node view is the only CSS consumer

`ImageResize.tsx` passes every dimension through `toCssLength` — the `useState` seed, the effect that syncs from `node.attrs`, and both `style` objects. The resize drag path already measures with `getBoundingClientRect()` and writes `px`, so it needs no change: once the initial render is correct, dragging a v4 image starts from its real rendered size and stores a v5-shaped value.

`"auto"` stays the local fallback for "no stored size" and stays out of the attribute.

### Serialization is spec-valid and version-neutral

`renderHTML` passes each dimension through `toHtmlDimension`. Consequences, deliberate:

- v4 content loaded and saved with no size edit serializes to `width="300"` — identical to its input.
- v5 content previously stored as `width="300px"` serializes to `width="300"` on the next save. Rendering does not change: browsers legacy-parse both to 300.
- A `%` width from pasted HTML keeps its `%`.
- An unrepresentable value (`"20em"`) is dropped from the attribute rather than emitted as a value browsers would mis-parse (`20em` legacy-parses to 20 — twenty pixels, a silent shrink). The image falls back to natural size, which is the honest outcome.

### Test cases

- `toCssLength`: `"300"` → `"300px"`, `"300.5"` → `"300.5px"`, `"300px"` → `"300px"`, `"50%"` → `"50%"`, `"auto"` → `"auto"`, `null`/`""` → `undefined`.
- `toHtmlDimension`: `"300"` → `"300"`, `"300px"` → `"300"`, `"50%"` → `"50%"`, `"20em"` → `undefined`, `"auto"` → `undefined`, `null` → `undefined`.
- Round-trip through a real `Editor`: v4 `<img width="300" height="200">` parses to `"300"`/`"200"` and serializes back to `width="300" height="200"`; v5 `<img width="300px">` serializes to `width="300"`; `<img style="width:300px">` serializes to `width="300"`.
- Node view render (RTL): a node with `width: "300"` renders an `<img>` whose inline style width is `300px`; a node with `width: "300px"` likewise; a node with no width renders `auto`.
