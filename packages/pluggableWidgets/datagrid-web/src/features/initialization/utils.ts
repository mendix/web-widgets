import { ListValue } from "mendix";
import { InitViewState } from "./base";

export function hasViewState(ds: ListValue): boolean {
    return ds.sortOrder.length > 0 || ds.filter !== undefined;
}

export function setViewState(props: { ds: ListValue; initViewState: InitViewState }): void {
    const { ds, initViewState } = props;
    if (initViewState?.sortOrder) {
        ds.setSortOrder(initViewState.sortOrder as any);
    }
}
