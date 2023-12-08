import { ListValue } from "mendix";
import { ComputedInitState } from "./base";
import { initGridState } from "../state/utils";
import { GridColumn } from "../../typings/GridColumn";

export function initFromViewState(props: { columns: GridColumn[]; ds: ListValue }): ComputedInitState | undefined {
    return [initGridState(props.columns, props.ds.filter)];
}
