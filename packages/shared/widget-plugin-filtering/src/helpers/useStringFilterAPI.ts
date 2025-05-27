import { useRef } from "react";
import { FilterType, getFilterStore, useFilterContextValue } from "../context";
import { APIError, EKEYMISSING, EMISSINGSTORE, EStoreTypeMisMatch } from "../errors";
import { error, Result, value } from "../result-meta";
import { isStringFilter } from "../stores/input/store-utils";
import { String_InputFilterInterface } from "../typings/InputFilterInterface";

export interface String_FilterAPIv2 {
    filterStore: String_InputFilterInterface;
    parentChannelName?: string;
}

export function useStringFilterAPI(key: string): Result<String_FilterAPIv2, APIError> {
    const ctx = useFilterContextValue();
    const strAPI = useRef<String_FilterAPIv2>();

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

    const store = getFilterStore(api.provider.value, FilterType.STRING, key);

    if (store === null) {
        return error(EMISSINGSTORE);
    }

    if (store.storeType !== "input" || !isStringFilter(store)) {
        return error(EStoreTypeMisMatch("text filter", store.storeType !== "input" ? "option list" : store.arg1.type));
    }

    return value((strAPI.current ??= { filterStore: store, parentChannelName: api.parentChannelName }));
}
