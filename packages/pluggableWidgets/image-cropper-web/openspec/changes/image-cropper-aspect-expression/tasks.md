## 1. Verify inherited PR code

- [x] 1.1 Build shared deps then the widget, run the existing unit suite (`pnpm run test`) to confirm the PR's prop-shape changes pass on the takeover branch
- [x] 1.2 Confirm no resource leaks introduced by the PR: blob-URL revoke, fetch-generation guard, and uri-reaction disposer are all still torn down in `setup()`'s cleanup (Big→number conversion adds no lifecycle-bound resource)

## 2. Loading-state contract (chosen policy: defer box until ratio ready)

- [x] 2.1 In `ImageCropperStore`, expose a readiness signal for the custom ratio: in "Custom" mode, `false` while either `customAspectWidth`/`customAspectHeight` is not `Available`; irrelevant (always ready) for preset modes
- [x] 2.2 Gate initial crop seeding on readiness — in "Custom" mode, do NOT seed the crop box on image `onLoad` until both sides are `Available`; seed once at the correct ratio when ready
- [x] 2.3 Ensure the auto-apply gate stays disarmed across a ratio-driven re-seed so no wrong-ratio image is committed back to the bound attribute (reuse `armed()` / programmatic-vs-user distinction)
- [x] 2.4 Re-seed deterministically when the resolved ratio changes value→value (e.g. record swap): rebuild via `buildInitialCrop` in one step, no intermediate `ReactCrop` interpolation frame
- [x] 2.5 Retain the last valid crop box when the ratio transitions Available→unavailable, until a new ratio resolves (no free-aspect flash)

## 3. Tests

- [x] 3.1 Store spec: ratio unavailable → no seed; ratio resolves → single seed at correct ratio
- [x] 3.2 Store spec: ratio value→value transition re-seeds once; no `setValue` (commit) fires from a ratio change alone
- [x] 3.3 Store spec: Available→unavailable retains the last box
- [x] 3.4 Editor preview spec: numeric-literal expressions render the ratio; non-literal/attribute falls back to free aspect without throwing
- [x] 3.5 Regression: zero/negative/empty side → free aspect, no throw (aspectRatio util)

## 4. Packaging & docs

- [x] 4.1 Update `CHANGELOG.md` under `[Unreleased]` (Keep a Changelog format) — keep the user-facing "Custom aspect ratio ... expression/attribute" entry, no implementation detail
- [x] 4.2 Raise `marketplace.minimumMXVersion` from `10.21.0` to `11.12` in `package.json`
- [x] 4.3 Do NOT bump the widget `version` — release automation handles version bumps at release time

## 5. Verify

- [x] 5.1 `pnpm run test` green in the package
- [ ] 5.2 Manual/E2E check in a Studio Pro test project: attribute-bound ratio, loading window shows no jump, record swap re-seeds cleanly
