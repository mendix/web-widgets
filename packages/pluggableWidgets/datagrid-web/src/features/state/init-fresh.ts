import { initGridState } from "../state/utils";
import { GridColumn } from "../../typings/GridColumn";
import { GridState } from "../../typings/GridState";

export function initFresh(props: { columns: GridColumn[] }): [GridState] | undefined {
    return [initGridState(props.columns)];
}
