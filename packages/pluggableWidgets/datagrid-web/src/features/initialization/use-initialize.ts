import { useEffect, useRef } from "react";
import { ListValue, ValueStatus, EditableValue } from "mendix";
import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { ComputedInitState, InitState } from "./base";
import { initFromSettings } from "./init-from-settings";
import { initFromViewState } from "./init-from-view-state";
import { initFresh } from "./init-fresh";
import { hasViewState, setViewState } from "./utils";
import { Column } from "../../helpers/Column";

export function useInitialize(props: DatagridContainerProps, columns: Column[]): [InitState | undefined] {
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
): [InitState | undefined] {
    const computed = useRef<InitState>();

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
        setViewState({ ds: datasource, initViewState });
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
        result = initFromViewState({
            ds,
            columns
        });
    } else {
        result = initFresh({
            columns
        });
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
