import { ListValue, EditableValue } from "mendix";
import { ComputedInitState } from "./base";
import { initGridState } from "../state/grid-state";
import { GridColumn } from "../../typings/GridColumn";

export function initFromSettings(props: {
    columns: GridColumn[];
    ds: ListValue;
    settings: EditableValue<string>;
}): ComputedInitState | undefined {
    return [initGridState(props.columns, props.ds.filter)];
}
