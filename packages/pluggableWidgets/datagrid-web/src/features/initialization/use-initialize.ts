import { useState, useEffect } from "react";
import { ListValue } from "mendix";
import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { ComputedInitState, InitState, InitViewState } from "./base";
import { initFromSettings } from "./init-from-settings";
import { initFromViewState } from "./init-from-view-state";
import { initFresh } from "./init-fresh";
import { hasViewState } from "./utils";
import { GridColumn } from "../../typings/GridColumn";

export function useInitialize(
    { datasource, configurationAttribute: settings, pageSize, pagination }: DatagridContainerProps,
    columns: GridColumn[]
): [InitState | undefined] {
    const [initState, setInitState] = useState<InitState>();

    function initialize(): void {
        if (initState) {
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
                setInitState
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
