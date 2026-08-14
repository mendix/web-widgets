## Context

The Rich Text widget's image insert dialog (`ImageDialog.tsx`) currently collects only `src`, `alt`, and `title`, then calls `editor.chain().focus().setImage(imageAttrs).run()`. The underlying `ImageResize` TipTap extension already defines `width` and `height` node attributes (both defaulting to `null`), but they are only ever populated by the drag-resize node view (`ImageResize.tsx`) after the image is on the canvas. This change surfaces those attributes at insert time.

Constraints:

- No node schema changes are required — `width`/`height` attributes already flow through `setImage`.
- Dialog UI must match existing patterns (`dialog-field`, i18n via `useT`).
- Values must be consistent with the drag-resize output, which writes pixel strings like `"300px"`.

## Goals / Non-Goals

**Goals:**

- Let users set initial width and (optionally) height when inserting an image.
- Provide a "maintain aspect ratio" toggle that, when on, applies width only and lets the browser derive height.
- Keep the change contained to the dialog + i18n + tests; no extension or widget-prop changes.

**Non-Goals:**

- Changing how drag-resize behaves (it continues to always preserve ratio).
- Persisting "maintain aspect ratio" as a property of the image node — it is an insert-time decision only.
- Supporting non-pixel units (`%`, `em`) or a unit picker.
- Preloading images to read natural dimensions.

## Decisions

**Decision: "Maintain aspect ratio" leaves height auto (Interpretation A).**
When checked, only `width` is applied and `height` is left `null`, so the browser renders height proportionally via `height: auto`. Chosen over computing a locked height because it requires no natural-dimension lookup (no image preloading, no async resolution differences between URL/base64/entity sources) and always stays proportional.

- Alternative considered: read natural width/height and write both attributes. Rejected — adds async complexity and source-specific handling for little benefit at insert time.

**Decision: Pixel-only number inputs.**
Inputs are numeric and interpreted as pixels, applied as `"<n>px"` strings to match the drag-resize output. A unit picker was considered but rejected as scope creep.

**Decision: Checkbox defaults to ON.**
Matches common editor behavior and avoids accidental distortion. Height input is disabled (greyed) while ON.

**Decision: Non-destructive toggle.**
Toggling the checkbox ON keeps any previously typed height value in component state; it is simply not sent on submit. Un-ticking restores the value. Avoids surprising data loss.

**Decision: Apply only filled, positive-numeric values.**
Empty or invalid (non-numeric, zero, negative) width/height are omitted from `imageAttrs`, falling back to today's natural-size behavior. Any combination of filled/empty is allowed (e.g., height only → width auto).

## Risks / Trade-offs

- [Ratio checkbox is insert-time only, but drag-resize always keeps ratio] → Acceptable; an image inserted with ratio unchecked (distorted) will re-derive ratio from its current box on next drag. Documented as a non-goal.
- [Users may expect `%` or other units] → Out of scope for this change; pixel-only keeps behavior consistent with existing resize. Can be revisited later.
- [Disabled height field showing a stale typed value could confuse] → Field is visually greyed while checkbox is ON, signalling it is inactive; value is preserved intentionally.
