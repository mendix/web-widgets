import { ListValue } from "mendix";
import { InitViewState } from "./base";

export function hasViewState(ds: ListValue): boolean {
    /**
     * For now we check only for sortOrder as we can restore
     * grid state from this property.
     * In future we may also check filter property as well.
     */
    return ds.sortOrder.length > 0;
}

export function setViewState(props: { ds: ListValue; initViewState: InitViewState }): void {
    const { ds, initViewState } = props;
    if (initViewState?.sortOrder) {
        ds.setSortOrder(initViewState.sortOrder as any);
    }
}
