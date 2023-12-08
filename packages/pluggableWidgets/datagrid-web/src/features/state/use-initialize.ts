import { useEffect, useRef } from "react";
import { ListValue, ValueStatus, EditableValue } from "mendix";
import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { ComputedInitState } from "./base";
import { initFromSettings } from "./init-from-settings";
import { hasViewState, setViewState } from "./datasource";
import { Column } from "../../helpers/Column";
import { GridState } from "../../typings/GridState";
import { initFromDataSource, initGridState } from "./utils";

export function useInitialize(props: DatagridContainerProps, columns: Column[]): [GridState | undefined] {
    const { datasource, pageSize, pagination } = props;
    const [initState] = useInitState(props, columns);
    const isAvailable = (useRef(false).current ||= datasource.status === ValueStatus.Available);

    useEffect(
        () =>
            onMounted({
                ds: datasource,
                pageSize,
                isInfinite: pagination === "virtualScrolling"
            }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    return isAvailable ? [initState] : [undefined];
}

/**
 * To prevent spinner flickering, we compute init state
 * as soon as possible, so, we compute during render, without and
 * avoiding useEffect.
 */
function useInitState(
    { datasource, configurationAttribute: settings }: DatagridContainerProps,
    columns: Column[]
): [GridState | undefined] {
    const computed = useRef<GridState>();

    if (computed.current) {
        return [computed.current];
    }

    const result = initialize({
        ds: datasource,
        settings,
        columns
    });

    if (result === undefined) {
        return [undefined];
    }

    const [initState, initViewState] = result;

    if (initViewState) {
        setViewState(datasource, initViewState);
    }

    computed.current = initState;
    return [computed.current];
}

function initialize(props: {
    ds: ListValue;
    columns: Column[];
    settings: EditableValue<string> | undefined;
}): ComputedInitState | undefined {
    const { ds, columns, settings } = props;

    if (columns.some(column => column.status === ValueStatus.Loading)) {
        return;
    }

    let result: ComputedInitState | undefined;
    if (settings) {
        result = initFromSettings({
            ds,
            columns,
            settings
        });
    } else if (hasViewState(ds)) {
        result = [initFromDataSource(ds, columns)];
    } else {
        result = [initGridState(columns, ds.filter)];
    }

    return result;
}

function onMounted(props: { ds: ListValue; pageSize: number; isInfinite: boolean }): void {
    const { ds, pageSize, isInfinite } = props;
    if (ds.limit === Number.POSITIVE_INFINITY) {
        ds.setLimit(pageSize);
    }
    ds.requestTotalCount(!isInfinite);
}
