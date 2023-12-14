import { ListValue } from "mendix";
import { Effect, clearNode, createDomain } from "effector";
import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { GridSettings } from "../../typings/GridSettings";
import { DynamicStorage } from "../storage/base";
import { debounce } from "@mendix/widget-plugin-platform/utils/debounce";

export type ModelEffects = {
    updateLimitFx: Effect<[ListValue, number], void, Error>;
    updateOffsetFx: Effect<[ListValue, number], void, Error>;
    updateOrderFx: Effect<[ListValue, ListValue["sortOrder"]], void, Error>;
    setupDatasourceFx: Effect<DatagridContainerProps, void, Error>;
    writeSettingsFx: Effect<[GridSettings, DynamicStorage], void, Error>;
    abortWriteFx: Effect<unknown, void, Error>;
};

export function effects(): ModelEffects {
    const domain = createDomain();
    domain.onCreateEffect(fx => fx.watch(payload => console.log("DEBUG", fx.shortName, payload)));
    const setupDatasourceFx = domain.createEffect((props: DatagridContainerProps) => {
        props.datasource.setLimit(props.pageSize);
        if (props.pagination === "buttons") {
            props.datasource.requestTotalCount(props.datasource.hasMoreItems ?? false);
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

    const writeSettings = ([settings, storage]: [GridSettings, DynamicStorage]): void => {
        if (storage.status !== "ready") {
            return;
        }
        storage.value.save(settings);
    };

    const [write, abortWrite] = debounce(writeSettings, 1000);

    const writeSettingsFx = domain.createEffect(write);
    writeSettingsFx.shortName = "writeFx";

    const abortWriteFx = domain.createEffect(abortWrite);
    abortWriteFx.shortName = "aborted";

    return { updateLimitFx, updateOffsetFx, updateOrderFx, setupDatasourceFx, writeSettingsFx, abortWriteFx };
}
