import { useRef } from "react";
import { FilterType, getFilterStore, useFilterContextValue } from "../provider-next";
import { error, value, Result } from "../result-meta";
import { Number_InputFilterInterface } from "../typings/InputFilterInterface";
import { APIError, EGRPKEY, EMISSINGSTORE, ESTORETYPE } from "../errors";
import { isNumberFilter } from "../stores/store-utils";

export interface Number_FilterAPIv2 {
    filterStore: Number_InputFilterInterface;
    parentChannelName?: string;
}

export function useNumberFilterAPI(key: string): Result<Number_FilterAPIv2, APIError> {
    const ctx = useFilterContextValue();
    const numAPI = useRef<Number_FilterAPIv2>();

    if (ctx.hasError) {
        return error(ctx.error);
    }

    const api = ctx.value;

    if (api.provider.hasError) {
        return error(api.provider.error);
    }

    if (api.provider.value.type === "key-value" && key === "") {
        return error(EGRPKEY);
    }

    const store = getFilterStore(api.provider.value, FilterType.NUMBER, key);

    if (store === null) {
        return error(EMISSINGSTORE);
    }

    if (store.storeType === "optionlist" || !isNumberFilter(store)) {
        return error(ESTORETYPE);
    }

    return value((numAPI.current ??= { filterStore: store, parentChannelName: api.parentChannelName }));
}
