import { useRef, useMemo, useEffect } from "react";
import { ListValue, EditableValue } from "mendix";
import { useWatchValues } from "@mendix/widget-plugin-hooks/useWatchValues";
import { debounce } from "@mendix/widget-plugin-platform/utils/debounce";
import { GridState } from "../../typings/GridState";
import { useGridState } from "./grid-state";
import { GridColumn } from "../../typings/GridColumn";
import { getSortInstructions } from "./utils";

type Props = {
    initState: GridState;
    columns: GridColumn[];
    datasource: ListValue;
    settings: EditableValue<string> | undefined;
};

export function useGridStateWithEffects(props: Props): ReturnType<typeof useGridState> {
    const ds = useRef(props.datasource);
    const settings = useRef(props.settings);
    const [state, fns] = useGridState(props.initState);
    const onStateChangeDelayed = useOnStateChangeDelayed();

    useMemo(() => {
        ds.current = props.datasource;
        settings.current = props.settings;
    }, [props.datasource, props.settings]);

    useWatchValues((_, [columns]) => fns.setColumns(columns), [props.columns]);

    useWatchValues(
        ([prev], [next]) => {
            onStateChange(prev, next, ds.current, settings.current);
            onStateChangeDelayed(prev, next, ds.current, settings.current);
        },
        [state]
    );

    return [state, fns];
}

function useOnStateChangeDelayed(): typeof onStateChangeDelayed {
    const [fn, abort] = useMemo(() => debounce(onStateChangeDelayed, 500), []);
    useEffect(() => abort, [abort]);
    return fn;
}

function onStateChange(
    prev: GridState,
    next: GridState,
    ds: ListValue,
    _settings: EditableValue<string> | undefined
): void {
    if (prev.sort !== next.sort) {
        ds.setSortOrder(getSortInstructions(next));
    }
}

function onStateChangeDelayed(
    _: GridState,
    next: GridState,
    __: ListValue,
    settings: EditableValue<string> | undefined
): void {
    settings?.setValue(
        JSON.stringify(
            {
                sort: next.sort,
                order: next.columnsOrder,
                hidden: next.columnsHidden,
                size: next.columnsSize
            },
            null,
            2
        )
    );
}
