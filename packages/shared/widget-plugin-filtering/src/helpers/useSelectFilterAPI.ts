import { useRef } from "react";
import { FilterType, getFilterStore, useFilterContextValue } from "../context";
import { APIError, EKEYMISSING, EMISSINGSTORE, EStoreTypeMisMatch } from "../errors";
import { Result, error, value } from "../result-meta";
import { PickerFilterStore } from "../typings/PickerFilterStore";

export interface Select_FilterAPIv2 {
    filterStore: PickerFilterStore;
    parentChannelName?: string;
}

export function useSelectFilterAPI(key: string): Result<Select_FilterAPIv2, APIError> {
    const ctx = useFilterContextValue();
    const slctAPI = useRef<Select_FilterAPIv2>();

    if (ctx.hasError) {
        return error(ctx.error);
    }

    const api = ctx.value;

    if (api.provider.hasError) {
        return error(api.provider.error);
    }

    if (api.provider.value.type === "key-value" && key === "") {
        return error(EKEYMISSING);
    }

    const store = getFilterStore(api.provider.value, FilterType.ENUMERATION, key);

    if (store === null) {
        return error(EMISSINGSTORE);
    }

    if (store.storeType !== "select" && store.storeType !== "refselect") {
        return error(EStoreTypeMisMatch("dropdown filter", store.arg1.type));
    }

    return value((slctAPI.current ??= { filterStore: store, parentChannelName: api.parentChannelName }));
}
