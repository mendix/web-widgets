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

### Decision 1: Distinguish "pending" from "free" at the computed layer

`aspect` currently collapses three distinct states (pending, resolved-to-free, resolved-to-ratio) into `number | undefined`. `undefined` is overloaded to mean both "free aspect" and "not yet known", which is exactly why the box seeds wrong.

**Chosen:** Encode all three in the single `number | undefined` return, using a `FREE_ASPECT = -1` sentinel:

- `undefined` — pending
- `FREE_ASPECT` — resolved, unconstrained
- positive — resolved, locked

Readiness then reduces to `aspect !== undefined`, so no consumer re-inspects the raw props or special-cases preset modes. A `toCropAspect()` mapper collapses the sentinel back to `undefined` at the component boundary, since ReactCrop and `buildInitialCrop` read `undefined` as "free" and would produce broken geometry from a negative.

**Alternatives considered:**

- _Default to free while loading_ (original behavior) — rejected: produces the jump the note warns about.
- _Derive readiness by re-reading `props.aspectRatio` and each side's status_ — rejected: leaks the prop shape into every consumer and needs an explicit "presets are always ready" branch.
- _Discriminated union (`{ready: false} | {ready: true, ratio?}`)_ — rejected: type-safe and sentinel-free, but a wider diff across all consumers for the same behavior.

### Decision 1a: `Loading` retains, `Unavailable` resolves

Treating "not `Available`" as one bucket produces a bug at each end:

- **`Loading`** carries the _previous_ value per `DynamicValue`'s contract, so reading `.value` regardless of status holds the ratio steady across a record swap. First render has no previous value → falls through to pending.
- **`Unavailable`** is terminal — no value is coming. Pending forever would leave the box unseeded, so it resolves to `FREE_ASPECT`.

### Decision 2: Re-seed deterministically on ratio change, never commit intermediate frames

When the resolved ratio changes, rebuild the crop box in one step (`buildInitialCrop`) rather than letting `ReactCrop` interpolate. Guard the auto-apply gate so a ratio change alone does not push a wrong-ratio image to the bound attribute — seeding is programmatic and must remain "disarmed" (the store already distinguishes user-driven commits from programmatic ones via `userDragged` / `armed()`).

### Decision 3: Editor preview parses numeric literals only

The editor has no runtime data — only expression _text_. `toNumber` parses a numeric literal and falls back to `undefined` (free aspect) otherwise. This is display-only and already implemented in the PR; the spec pins it so it isn't regressed.

## Risks / Trade-offs

- **Deferred seeding shows an unconstrained image briefly** while the expression loads → Mitigation: the image is already gated behind its own `ValueStatus.Available`; in practice the ratio usually resolves in the same or adjacent frame. Deferring the _crop box_ (not the image) is the least-surprising option.
- **Record change mid-session** flips the ratio to loading then to a new value → Mitigation: `Loading` retains the previous value, so the box holds until the new ratio resolves.
- **`FREE_ASPECT = -1` is a magic number** → Mitigation: named export, and `toCropAspect()` is the single boundary that strips it, so it cannot reach the crop geometry.

## Open Questions

Resolved: the loading-window box policy is (a) — no crop overlay until the ratio resolves. See Decision 1a for the `Loading` / `Unavailable` split.
