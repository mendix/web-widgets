## 1. Verify inherited PR code

- [x] 1.1 Build shared deps then the widget, run the existing unit suite (`pnpm run test`) to confirm the PR's prop-shape changes pass on the takeover branch
- [x] 1.2 Confirm no resource leaks introduced by the PR: blob-URL revoke, fetch-generation guard, and uri-reaction disposer are all still torn down in `setup()`'s cleanup (Big→number conversion adds no lifecycle-bound resource)

## 2. Loading-state contract (chosen policy: defer box until ratio ready)

- [x] 2.1 Encode pending / free / locked in `aspect` via the `FREE_ASPECT` sentinel so readiness is `aspect !== undefined` — no prop-sniffing, no preset special-case. Map `Loading` to its retained previous value and `Unavailable` to free (terminal, never pending). Strip the sentinel at the crop boundary with `toCropAspect`
- [x] 2.2 Gate initial crop seeding on readiness — in "Custom" mode, do NOT seed the crop box on image `onLoad` while the ratio is pending; seed once at the correct ratio when it resolves
- [x] 2.3 Ensure the auto-apply gate stays disarmed across a ratio-driven re-seed so no wrong-ratio image is committed back to the bound attribute (reuse `armed()` / programmatic-vs-user distinction)
- [x] 2.4 Re-seed deterministically when the resolved ratio changes value→value (e.g. record swap): rebuild via `buildInitialCrop` in one step, no intermediate `ReactCrop` interpolation frame
- [x] 2.5 Retain the last valid crop box when the ratio transitions resolved→pending, until a new ratio resolves (no free-aspect flash)

## 3. Tests

- [x] 3.1 Store spec: ratio unavailable → no seed; ratio resolves → single seed at correct ratio
- [x] 3.2 Store spec: ratio value→value transition re-seeds once; no `setValue` (commit) fires from a ratio change alone
- [x] 3.3 Store spec: resolved→pending retains the last box
- [x] 3.6 Store spec: a side that is `Unavailable` from the first render (and stays) resolves to free and still seeds; `Loading` over a previous value keeps that ratio
- [x] 3.4 Editor preview spec: numeric-literal expressions render the ratio; non-literal/attribute falls back to free aspect without throwing
- [x] 3.5 Regression: zero/negative/empty side → free aspect, no throw (aspectRatio util)

## 4. Packaging & docs

- [x] 4.1 Update `CHANGELOG.md` under `[Unreleased]` (Keep a Changelog format) — keep the user-facing "Custom aspect ratio ... expression/attribute" entry, no implementation detail. Do NOT add or edit a version header; those belong to the changelog/release PR
- [x] 4.2 Leave `package.json` untouched — the widget `version` is owned by release automation, not by this change

## 5. Verify

- [x] 5.1 `pnpm run test` green in the package
- [x] 5.2 Manual check in a Studio Pro test project, ratio bound to nullable Integer attributes driven by sibling inputs on the same data view: settled ratio seeds and locks; throttled load shows no free-aspect box before the real ratio; clearing a side (and `0` / negative) falls back to a free box rather than no box; record swap re-seeds once with no flash
- [ ] 5.3 Manual check that an unrelated re-render retains the crop and does not re-fetch the image (covers the `uri` reaction fix, which ships in this PR but predates the aspect work)
