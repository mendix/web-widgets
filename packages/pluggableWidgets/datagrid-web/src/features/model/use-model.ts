import { useEventCallback } from "@mendix/widget-plugin-hooks/useEventCallback";
import { debounce } from "@mendix/widget-plugin-platform/utils/debounce";
import { useMemo, useEffect } from "react";
import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { Column } from "../../helpers/Column";
import { GridSettings } from "../../typings/GridSettings";
import { SettingsStorage } from "../storage/base";
import { useSettingsClient } from "../storage/use-settings-client";
import { GridLoader, State } from "./GridLoader";
import { StateChangeFx } from "./use-grid-state";
import { getHash, sortToInst, stateToSettings } from "./utils";

const [writeSettings, abortWrite] = debounce((storage: SettingsStorage, settings: GridSettings) => {
    storage.save(settings);
}, 500);

export function useModel({
    name,
    columns: sourceColumns,
    datasource,
    pageSize,
    pagination: paginationType,
    configurationAttribute
}: DatagridContainerProps): {
    initState: State;
    columns: Column[];
    stateChangeFx: StateChangeFx;
} {
    const loader = useMemo(() => new GridLoader(), []);
    const columns = useMemo(() => sourceColumns.map((col, index) => new Column(col, index)), [sourceColumns]);
    const hash = useMemo(() => getHash(columns, name), [name, columns]);
    const settingsClient = useSettingsClient(hash, configurationAttribute);
    const stateChangeFx = useEventCallback<StateChangeFx>((prevState, newState) => {
        if (prevState.filter !== newState.filter) {
            datasource.setFilter(newState.filter);
        }

        if (prevState.sortOrder !== newState.sortOrder) {
            datasource.setSortOrder(sortToInst(newState.sortOrder, columns));
        }

        if (settingsClient.status === "available") {
            const settings = stateToSettings({
                settingsHash: hash,
                name,
                columns: newState.allColumns,
                hidden: newState.hidden,
                columnOrder: newState.columnOrder,
                size: newState.size,
                sortOrder: newState.sortOrder
            });

            writeSettings(settingsClient.settings, settings);
        }
    });

    useEffect(() => abortWrite, []);

    return {
        initState: loader.getInitState(datasource, paginationType, pageSize, columns, settingsClient),
        columns,
        stateChangeFx
    };
}
