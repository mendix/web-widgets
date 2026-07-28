## Context

`customAspectWidth` / `customAspectHeight` moved from static `integer` props to `expression` props with `returnType Integer`, delivered by community PR #2333. Static integers were available synchronously on first render; expressions (especially attribute bindings) are `DynamicValue<Big>` and resolve **asynchronously** through `ValueStatus.Loading → Available`.

The aspect is exposed as a single MobX `computed` in `ImageCropperStore`:

```ts
get aspect(): number | undefined {
    const toNumber = p => p.status === ValueStatus.Available && p.value ? p.value.toNumber() : undefined;
    return resolveAspectRatio(this.props.aspectRatio, toNumber(width), toNumber(height));
}
```

`aspect` flows to `CropArea`, which calls `buildInitialCrop(img, aspect)` on `<img>` `onLoad` and passes `aspect` to `ReactCrop`. The `handleImageLoad` callback lists `aspect` in its dependency array, so the seeding callback changes identity when the ratio resolves.

Current gap: while an expression is `Loading`, `toNumber` returns `undefined` → `resolveAspectRatio` returns `undefined` → **free aspect**. If the image loads during this window, the box seeds free; when the expression resolves the ratio flips and the box jumps. Worse, an auto-apply during that window could commit a wrongly-cropped image back to the bound attribute.

## Goals / Non-Goals

**Goals:**

- Data-driven custom ratio via attribute/expression binding.
- No visible box "jump" and no committed wrong-ratio crop during the async load window.
- Deterministic re-seed when the ratio transitions unknown → known or value → value.
- Editor preview renders literal ratios and degrades gracefully for non-literals.

**Non-Goals:**

- Reworking the preset (non-custom) aspect modes — they remain synchronous enum values.
- Supporting fractional/decimal ratios beyond what `Integer` return type allows.
- Changing the crop/zoom/export pipeline beyond ratio seeding.

## Decisions

### Decision 1: Distinguish "loading" from "free" at the computed layer

`aspect` currently collapses three distinct states (Loading, resolved-to-free, resolved-to-ratio) into `number | undefined`. `undefined` is overloaded to mean both "free aspect" and "not yet known", which is exactly why the box seeds wrong.

**Chosen:** In "Custom" mode, treat "either side not Available" as a distinct `loading` signal, separate from a resolved free aspect. Consumers (initial-crop seeding, auto-apply) gate on readiness: do not seed/commit until the custom ratio is resolved.

**Alternatives considered:**

- _Default to free while loading_ (current behavior) — rejected: produces the jump the note warns about.
- _Cache the last integer value_ — rejected: no meaningful "last value" on first load, and stale values across record changes are their own bug.

### Decision 2: Re-seed deterministically on ratio change, never commit intermediate frames

When the resolved ratio changes, rebuild the crop box in one step (`buildInitialCrop`) rather than letting `ReactCrop` interpolate. Guard the auto-apply gate so a ratio change alone does not push a wrong-ratio image to the bound attribute — seeding is programmatic and must remain "disarmed" (the store already distinguishes user-driven commits from programmatic ones via `userDragged` / `armed()`).

### Decision 3: Editor preview parses numeric literals only

The editor has no runtime data — only expression _text_. `toNumber` parses a numeric literal and falls back to `undefined` (free aspect) otherwise. This is display-only and already implemented in the PR; the spec pins it so it isn't regressed.

### Decision 4: Raise `minimumMXVersion` to 11.12

Expression-typed properties with `returnType Integer` bound to attributes are the supported baseline. Bump `marketplace.minimumMXVersion` from `10.21.0` to `11.12`.

## Risks / Trade-offs

- **Deferred seeding shows an unconstrained image briefly** while the expression loads → Mitigation: the image is already gated behind its own `ValueStatus.Available`; in practice the ratio usually resolves in the same or adjacent frame. Deferring the _crop box_ (not the image) is the least-surprising option.
- **Record change mid-session** flips the ratio to unavailable then to a new value → Mitigation: retain last valid box until the new ratio resolves (spec scenario), avoiding a free-aspect flash.
- **`minimumMXVersion` bump** drops support for older Studio Pro → accepted: expression binding requires it; documented in CHANGELOG.

## Open Questions

- **Loading-window box policy**: while the ratio is unavailable, should the widget (a) render the image with **no crop overlay** until the ratio resolves, or (b) render a **free-aspect box** and re-seed on resolve? (a) is cleanest (no jump) but shows a bare image for a frame; (b) is more familiar but risks a visible snap. This is the one behavior decision worth confirming before implementation — see tasks.md.
