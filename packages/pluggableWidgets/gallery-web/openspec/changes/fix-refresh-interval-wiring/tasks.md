## 1. Fix wiring

- [x] 1.1 In `src/model/configs/Gallery.config.ts`, set `refreshIntervalMs: props.refreshInterval * 1000`
- [x] 1.2 In `src/model/containers/Gallery.container.ts` `_02_queryBindings.init`, bind `GY.refreshInterval` to `config.refreshIntervalMs`

## 2. Regression tests (`createGalleryContainer.spec.ts`)

- [x] 2.1 Test: `refreshInterval: 5` gives `config.refreshIntervalMs` and `GY.refreshInterval` equal to 5000
- [x] 2.2 Test (fake timers): after `setupService.setup()`, `datasource.reload` is not called at 4999 ms and is called once at 5000 ms
- [x] 2.3 Test (fake timers): `refreshInterval: 0` means no reload after 60 s
- [x] 2.4 Confirm RED without the fix (2.1 and 2.2 fail) and GREEN with it

## 3. Changelog and verification

- [x] 3.1 Add a "Fixed" entry under `[Unreleased]` in `CHANGELOG.md`
- [x] 3.2 `pnpm run test` and `pnpm run lint` pass in `packages/pluggableWidgets/gallery-web`
- [ ] 3.3 Manual QA in Studio Pro: Gallery with Refresh time = 5 picks up data changed elsewhere within ~5 s; with 0 it does not
