import { ListValue } from "mendix";

export function hasViewState(ds: ListValue): boolean {
    /**
     * For now we check only for sortOrder as we can restore
     * grid state from this property.
     * In future we may also check filter property as well.
     */
    return ds.sortOrder.length > 0;
}
