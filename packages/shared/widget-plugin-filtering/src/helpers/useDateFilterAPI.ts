import { useRef } from "react";
import { FilterType, getFilterStore, useFilterContextValue } from "../context";
import { APIError, EKEYMISSING, EMISSINGSTORE, EStoreTypeMisMatch } from "../errors";
import { error, Result, value } from "../result-meta";
import { isDateFilter } from "../stores/input/store-utils";
import { Date_InputFilterInterface } from "../typings/InputFilterInterface";

export interface Date_FilterAPIv2 {
    filterStore: Date_InputFilterInterface;
    parentChannelName?: string;
}

export function useDateFilterAPI(key: string): Result<Date_FilterAPIv2, APIError> {
    const ctx = useFilterContextValue();
    const dateAPI = useRef<Date_FilterAPIv2>();

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

    const store = getFilterStore(api.provider.value, FilterType.DATE, key);

    if (store === null) {
        return error(EMISSINGSTORE);
    }

    if (store.storeType !== "input" || !isDateFilter(store)) {
        return error(EStoreTypeMisMatch("date filter", store.storeType !== "input" ? "select" : store.arg1.type));
    }

    return value((dateAPI.current ??= { filterStore: store, parentChannelName: api.parentChannelName }));
}
