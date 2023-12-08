import { useState, useEffect } from "react";
import { ListValue, ValueStatus } from "mendix";
import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { ComputedInitState, InitState, InitViewState } from "./base";
import { initFromSettings } from "./init-from-settings";
import { initFromViewState } from "./init-from-view-state";
import { initFresh } from "./init-fresh";
import { hasViewState } from "./utils";
import { Column } from "../../helpers/Column";

export function useInitialize(
    { datasource, configurationAttribute: settings, pageSize, pagination }: DatagridContainerProps,
    columns: Column[]
): [InitState | undefined] {
    const [initState, setInitState] = useState<InitState>();

    function initialize(): void {
        if (initState) {
            return;
        }

        if (columns.some(column => column.status === ValueStatus.Loading)) {
            return;
        }

        if (datasource.status === ValueStatus.Loading) {
            return;
        }

        let result: ComputedInitState | undefined;
        if (settings) {
            result = initFromSettings({
                ds: datasource,
                columns,
                settings
            });
        } else if (hasViewState(datasource)) {
            result = initFromViewState({
                ds: datasource,
                columns
            });
        } else {
            result = initFresh({
                columns
            });
        }

        if (result === undefined) {
            return;
        }

        const [nextState, initViewState] = result;
        setViewState({ ds: datasource, initViewState, pageSize, isInfinite: pagination === "virtualScrolling" });
        setInitState(nextState);
    }

    useEffect(initialize, [datasource, settings, initState, pageSize, pagination, columns]);

    return [initState];
}

function setViewState(props: {
    ds: ListValue;
    initViewState: InitViewState | undefined;
    pageSize: number;
    isInfinite: boolean;
}): void {
    const { ds, initViewState, pageSize, isInfinite } = props;
    if (initViewState?.sortOrder) {
        ds.setSortOrder(initViewState.sortOrder as any);
    }
    if (ds.limit === Number.POSITIVE_INFINITY) {
        ds.setLimit(pageSize);
    }
    ds.requestTotalCount(!isInfinite);
}
