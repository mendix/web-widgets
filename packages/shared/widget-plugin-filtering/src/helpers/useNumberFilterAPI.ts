import { useRef } from "react";
import { FilterType, getFilterStore, useFilterContextValue } from "../context";
import { APIError, EMISSINGSTORE, EStoreTypeMisMatch } from "../errors";
import { error, Result, value } from "../result-meta";
import { isNumberFilter } from "../stores/input/store-utils";
import { Number_InputFilterInterface } from "../typings/InputFilterInterface";

export interface Number_FilterAPIv2 {
    filterStore: Number_InputFilterInterface;
    parentChannelName?: string;
}

export function useNumberFilterAPI(): Result<Number_FilterAPIv2, APIError> {
    const ctx = useFilterContextValue();
    const numAPI = useRef<Number_FilterAPIv2>();

    if (ctx.hasError) {
        return error(ctx.error);
    }

    const api = ctx.value;

    if (api.provider.hasError) {
        return error(api.provider.error);
    }

    const store = getFilterStore(api.provider.value, FilterType.NUMBER);

    if (store === null) {
        return error(EMISSINGSTORE);
    }

    if (store.storeType !== "input" || !isNumberFilter(store)) {
        return error(
            EStoreTypeMisMatch("number filter", store.storeType !== "input" ? "option list" : store.arg1.type)
        );
    }

    return value((numAPI.current ??= { filterStore: store, parentChannelName: api.parentChannelName }));
}
