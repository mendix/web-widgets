## Why

The Image widget's `imageObject` and `defaultImageDynamic` properties are declared as `type="image"` without `allowUpload`. Mendix has deprecated this form of the image/file property type — `DynamicValue<WebImage>` will be removed in Mendix 12 — and apps using the widget on Studio Pro 11.8+ already see a deprecation warning at design time. The fix is to set `allowUpload="true"` on both properties, per Mendix's own migration guidance.

## What Changes

- `allowUpload="true"` added to `imageObject` and `defaultImageDynamic` in `Image.xml`.
- Generated typings (`ImageProps.d.ts`) change `imageObject`/`defaultImageDynamic` from `DynamicValue<WebImage>` to `EditableImageValue<ImageValue>`.
- `Image.tsx` reads `.status` and `.value.uri` off both props today — `EditableImageValue` exposes the same shape (extends the same status/value base as `DynamicValue`), so no logic change is required. Widget stays display-only; no upload UI is added.
- `package.json` `marketplace.minimumMXVersion` bumped to `11.12.0` (LTS, confirmed with ticket reporter — 11.11 has native `allowUpload` support but 11.12 is the intended floor).
- CHANGELOG entry added under `[Unreleased]`. Widget version stays unbumped for now — version bumps happen at release time per repo convention; this change requires a major bump (2.0.0) once released, since `minimumMXVersion` is raised.

Verified in Studio Pro (11.12, fresh test app) that `allowUpload="true"` does not remove the "Static" image-source option — both Static and Dynamic configuration remain available in the property editor, so existing apps configuring `imageObject`/`defaultImageDynamic` as a static asset are not broken by this change.

## Capabilities

### New Capabilities

<!-- none -->

### Modified Capabilities

<!-- none -->

## Root cause

Widget XML predates the `allowUpload` attribute (introduced Mendix 11.8, native widget support 11.11). Not fixed proactively when the attribute was introduced; ticket WC-3471 flags the resulting deprecation warning.

## Impact

- **Files**:
    - `packages/pluggableWidgets/image-web/src/Image.xml`
    - `packages/pluggableWidgets/image-web/typings/ImageProps.d.ts` (regenerated)
    - `packages/pluggableWidgets/image-web/package.json` (version, minimumMXVersion)
    - `packages/pluggableWidgets/image-web/CHANGELOG.md`
- **Behavior**: none — widget remains display-only, no upload UI added, no runtime logic change
- **Studio Pro UX**: none — Static/Dynamic image-source configuration both remain available (manually verified)
- **Breaking change**: minimum Mendix version raised from 9.24.0 to 11.12.0 — apps on older Mendix versions cannot upgrade to this widget version once released
- **Affected widget**: `@mendix/image-web` — requires a major version bump (2.0.0) at release time; not bumped in this change
