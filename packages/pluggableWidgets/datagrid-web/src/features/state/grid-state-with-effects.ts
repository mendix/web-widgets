import { useMemo, useEffect } from "react";
import { ListValue, EditableValue } from "mendix";
import { useWatchValues } from "@mendix/widget-plugin-hooks/useWatchValues";
import { debounce } from "@mendix/widget-plugin-platform/utils/debounce";
import { GridState } from "../../typings/GridState";
import { useGridState } from "./grid-state";
import { GridColumn } from "../../typings/GridColumn";
import { getSortInstructions } from "./utils";
import { AttrStorage } from "../settings/AttrStorage";
import { stateToSettings } from "../settings/utils";

type Props = {
    initState: GridState;
    columns: GridColumn[];
    datasource: ListValue;
    settings: EditableValue<string> | undefined;
};

export function useGridStateWithEffects(props: Props): ReturnType<typeof useGridState> {
    const [state, fns] = useGridState(props.initState);
    const onStateChangeDelayed = useOnStateChangeDelayed();

    useWatchValues((_, [columns]) => fns.setColumns(columns), [props.columns]);

    useWatchValues(
        ([prev], [next]) => {
            onStateChange(prev, next, props.datasource, props.settings);
            onStateChangeDelayed(prev, next, props.datasource, props.settings);
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
    attr: EditableValue<string> | undefined
): void {
    if (attr === undefined) {
        return;
    }

    const storage = new AttrStorage(attr);
    storage.save(stateToSettings(next));
}
