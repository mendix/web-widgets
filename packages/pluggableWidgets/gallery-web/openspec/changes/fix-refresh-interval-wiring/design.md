## Context

`DatasourceService` (`@mendix/widget-plugin-grid/src/core/Datasource.service.ts`) already contains the refresh timer. It takes `refreshIntervalMs` as an optional third constructor argument and schedules `backgroundRefresh()` when the value is above 0. Gallery injects it with `injected(DatasourceService, CORE.setupService, GY.queryGate, GY.refreshInterval.optional)`. Because `GY.refreshInterval` is never bound, brandi resolves the optional token to `undefined`, the constructor default of `0` applies, and the timer is never scheduled.

Datagrid wires the same service correctly: `datagridConfig` sets `refreshIntervalMs: props.refreshInterval * 1000`, and its main binding group runs `container.bind(DG.refreshInterval).toConstant(config.refreshIntervalMs)`.

## Goals / Non-Goals

**Goals:** restore the pre-migration behaviour with the smallest change, mirroring Datagrid.

**Non-Goals:**

- Changing `DatasourceService`.
- Changing the `showSilentRefresh` threshold (`props.refreshInterval > 1`, which was `>= 1` before the migration). That is a separate, cosmetic difference and is left as is.

## Decisions

- **Derive in config, bind in `_02_queryBindings.init`.** The ms value lives in `GalleryConfig`, the single source for derived settings, and the token is bound next to `GY.queryGate`, where `DatasourceService` gets its other dependencies. _Alternative:_ bind directly from `props` in `init`. Rejected because it would bypass `GalleryConfig`, which already declares `refreshIntervalMs`.
- **Container-level tests with fake timers.** These run `CORE.setupService.setup()` and advance timers, so they prove the full path from props through config, token and service to `datasource.reload()`. A config-only assertion would not have caught the missing binding.

## Risks / Trade-offs

- [Apps that set a refresh time while it was broken now start reloading] → This is the documented, intended behaviour, and it is called out in the changelog.
