## Why

Gallery's "Refresh time (in seconds)" property has no effect (WC-3630). When the widget moved to a DI container (`b5010ee79`, "feat: move to brandi", Jan 2026), `galleryConfig` was given a placeholder `refreshIntervalMs: 0`, and the `GY.refreshInterval` token injected into `DatasourceService` was never bound. Before the migration, `GalleryStore` passed `refreshInterval * 1000` to `DatasourceService`, so this is a regression. Apps that rely on Gallery refreshing periodically now show stale data.

## What Changes

- `galleryConfig` derives `refreshIntervalMs` from `props.refreshInterval * 1000`.
- The query binding group binds `GY.refreshInterval` to `config.refreshIntervalMs`, which is how Datagrid binds `DG.refreshInterval`.
- Regression tests at container level: the value reaches the config and token, the datasource reloads after the interval, and nothing reloads when the interval is 0.
- A CHANGELOG "Fixed" entry.

## Capabilities

### New Capabilities

- `refresh-interval`: Gallery periodically reloads its datasource according to the "Refresh time (in seconds)" property.

### Modified Capabilities

<!-- None: gallery-web has no existing spec for refresh behaviour. -->

## Impact

- `src/model/configs/Gallery.config.ts`, `src/model/containers/Gallery.container.ts`, `src/model/containers/__tests__/createGalleryContainer.spec.ts`, `CHANGELOG.md`.
- No XML, typings or dependency changes. `DatasourceService` (`@mendix/widget-plugin-grid`) is unchanged.
- Patch-level fix.
