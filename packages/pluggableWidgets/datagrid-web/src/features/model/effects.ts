import { ListValue } from "mendix";
import { Domain, Effect, clearNode, createDomain } from "effector";
import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { GridSettings } from "../../typings/GridSettings";
import { DynamicStorage } from "../storage/base";
import { debounce } from "@mendix/widget-plugin-platform/utils/debounce";
import { Gate, createGate } from "effector-react";

export type ModelEffects = {
    updateLimitFx: Effect<[ListValue, number], void, Error>;
    updateOffsetFx: Effect<[ListValue, number], void, Error>;
    updateOrderFx: Effect<[ListValue, ListValue["sortOrder"]], void, Error>;
    setupDatasourceFx: Effect<DatagridContainerProps, void, Error>;
    writeSettingsFx: Effect<[GridSettings, DynamicStorage], void, Error>;
    refreshFx: Effect<[ListValue, number], void, Error>;
    setViewStateAndReloadFx: Effect<[ListValue, ListValue["sortOrder"], ListValue["filter"]], void, Error>;
    updateFilterFx: Effect<[ListValue, ListValue["filter"]], void, Error>;
    // This gate should be used only for cleanup
    componentGate: Gate<void>;
};

const DEBUG = false;

export function effects(): ModelEffects {
    const domain = createDomain();
    const gate = createGate<void>();

    if (DEBUG) {
        domain.onCreateEffect(fx => fx.watch(payload => console.debug("DEBUG", fx.shortName, payload)));
    }

    const createFxWithCleanup = createCleanupHelper(gate, domain);

    const setupDatasourceFx = domain.createEffect((props: DatagridContainerProps) => {
        props.datasource.setLimit(props.pageSize);
        if (props.pagination === "buttons") {
            props.datasource.requestTotalCount(props.datasource.hasMoreItems ?? true);
        }
        // Preventing calling this effect on future updates.
        clearNode(setupDatasourceFx);
    });

    setupDatasourceFx.shortName = "setupDatasourceFx";

    const updateLimitFx = domain.createEffect(([ds, limit]: [ListValue, number]) => ds.setLimit(limit));
    updateLimitFx.shortName = "limitFx";

    const updateOffsetFx = domain.createEffect(([ds, offset]: [ListValue, number]) => ds.setOffset(offset));
    updateOffsetFx.shortName = "offsetFx";

    const updateOrderFx = domain.createEffect(([ds, order]: [ListValue, ListValue["sortOrder"]]) =>
        ds.setSortOrder(order)
    );
    updateOrderFx.shortName = "orderFx";

    const updateFilterFx = createFilterFx(createFxWithCleanup);
    updateFilterFx.shortName = "filterFx";

    const writeSettingsFx = createSettingsWriteFx(createFxWithCleanup);
    writeSettingsFx.shortName = "settingsFx";

    const refreshFx = createRefreshFx(createFxWithCleanup);
    refreshFx.shortName = "refreshFx";

    const setViewStateAndReloadFx = domain.createEffect(
        ([ds, sort, filter]: [ListValue, ListValue["sortOrder"], ListValue["filter"]]) => {
            ds.setSortOrder(sort);
            ds.setFilter(filter);
            // As we don't know for sure that setting filter and
            // sort will reload the datasource,
            // we take control and reload it manually.
            // This reload is essential as it is required to go from waitingDatasource to ready.
            ds.reload();
        }
    );
    setViewStateAndReloadFx.shortName = "setViewStateFx";

    return {
        updateLimitFx,
        updateOffsetFx,
        updateOrderFx,
        updateFilterFx,
        setupDatasourceFx,
        writeSettingsFx,
        refreshFx,
        componentGate: gate,
        setViewStateAndReloadFx
    };
}

function createFilterFx(createFx: CreateFxWithCleanup): Effect<[ListValue, ListValue["filter"]], void, Error> {
    const setFilter = ([ds, filter]: [ListValue, ListValue["filter"]]): void => {
        ds.setFilter(filter);
    };
    // After first render, many filters trying to set their init value to state.
    // To prevent multiple setFilter calls we debounce all calls in this effect.
    const [setFilterLazy, abort] = debounce(setFilter, 15);

    return createFx((payload: [ListValue, ListValue["filter"]]): (() => void) => {
        setFilterLazy(payload);
        return abort;
    });
}

function createSettingsWriteFx(createFx: CreateFxWithCleanup): Effect<[GridSettings, DynamicStorage], void, Error> {
    const writeSettings = ([settings, storage]: [GridSettings, DynamicStorage]): void => {
        if (storage.status === "ready") {
            storage.value.save(settings);
        }
    };

    const [write, abortWrite] = debounce(writeSettings, 500);

    return createFx((payload: [GridSettings, DynamicStorage]): (() => void) => {
        write(payload);
        return abortWrite;
    });
}

function createRefreshFx(createFx: CreateFxWithCleanup): Effect<[ListValue, number], void, Error> {
    return createFx(([datasource, timeout]: [ListValue, number]) => {
        let timeoutId: number;
        if (timeout > 0) {
            timeoutId = window.setTimeout(datasource.reload, timeout);
        }
        return (): void => clearTimeout(timeoutId);
    });
}

type HandlerWithCleanup<Payload> = (payload: Payload) => () => void;
// This one is similar of useEffect, but not equivalent
type CreateFxWithCleanup = <Payload>(handler: HandlerWithCleanup<Payload>) => Effect<Payload, void, Error>;

function createCleanupHelper(gate: Gate<void>, domain: Domain): CreateFxWithCleanup {
    return <Payload>(fn: HandlerWithCleanup<Payload>): Effect<Payload, void, Error> => {
        let cleanup: (() => void) | null = null;

        const handler = (payload: Payload): void => {
            cleanup?.();
            cleanup = fn(payload);
        };

        gate.close.watch(() => cleanup?.());

        return domain.createEffect(handler);
    };
}
