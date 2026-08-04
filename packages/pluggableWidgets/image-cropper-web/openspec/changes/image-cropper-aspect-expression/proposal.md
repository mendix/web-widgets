## Why

App developers need the Image Cropper's custom aspect ratio to be data-driven — bound to an attribute or expression — instead of a fixed design-time integer. This lets one page enforce different crop ratios per record (e.g. a product-type-specific ratio) without duplicating widgets. The community PR (#2333) delivered the core capability; taking it over surfaced a correctness gap: because expressions resolve asynchronously, the widget must define behavior for the loading/unavailable window so the crop box does not seed at the wrong ratio and then jump when the value arrives.

## What Changes

- Change `customAspectWidth` / `customAspectHeight` from `integer` to `expression` with `returnType Integer`, so they accept an attribute binding or any Integer-returning expression.
- Read each side as `DynamicValue<Big>`, treating only "loading with no value" as "not yet known"; an empty, unavailable, or non-positive side is settled and yields a free ratio.
- `resolveAspectRatio` returns a three-state result — pending, free, or locked — so readiness no longer has to re-inspect the raw props.
- Editor preview parses the expression _text_ (numeric literals only) and falls back to free aspect when the value can't be evaluated at design time.
- Define and enforce **loading-state behavior**: while either expression is unavailable, the widget must not seed or commit a default/free-aspect crop that would visibly jump once the real ratio resolves. (Gap not fully addressed by #2333 — the core of this takeover.)
- Fix a pre-existing bug found while testing the above: the uri reaction compared a freshly built object literal with `Object.is`, so every re-render counted as an image change and re-fetched the original bytes + cleared the crop box. Now compared by value.
- Update `CHANGELOG.md` under `[Unreleased]` following Keep a Changelog format.

## Capabilities

### New Capabilities

<!-- None — this widget already has a captured spec at openspec/specs/image-cropper/. -->

### Modified Capabilities

- `image-cropper`: **Aspect ratio** gains the expression-bound custom sides and the "not yet resolved" state; **Default crop selection** gains the deferred-seed / re-seed / retain rules for that async window. Adds requirements for crop retention across unrelated re-renders and for design-time preview of the custom ratio.

## Impact

- **Widget config**: `ImageCropper.xml` (property types + returnType), generated `typings/ImageCropperProps.d.ts`.
- **Runtime**: `stores/ImageCropperStore.ts` (`aspect` / `aspectReady` / `cropAspect`), `utils/aspectRatio.ts` (three-state result + `toCropAspect` boundary), `components/CropArea.tsx` (crop-seeding on aspect change), `utils/initialCrop.ts`.
- **Editor**: `ImageCropper.editorPreview.tsx` (literal parsing / free-aspect fallback).
- **Packaging**: `CHANGELOG.md` only — no `package.json` change.
- **Tests**: store, editor, rotation, grayscale, multi-instance specs already updated for the new prop shape; loading-state behavior needs coverage.
- **No new dependencies** (Big/DynamicValue already provided by the `mendix` package).
