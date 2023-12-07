import { InitState } from "./base";
import { initGridState } from "../grid-state";
import { GridColumn } from "../../typings/GridColumn";

export function initFresh(props: { columns: GridColumn[] }): [InitState] | undefined {
    return [initGridState(props.columns)];
}
