import { useRef } from "react";
import { FilterType, getFilterStore, useFilterContextValue } from "../provider-next";
import { error, value, Result } from "../result-meta";
import { String_InputFilterInterface } from "../typings/InputFilterInterface";
import { APIError, EMISSINGSTORE, ESTORETYPE } from "../errors";
import { isStringFilter } from "../stores/store-utils";

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

    const store = getFilterStore(api.provider.value, FilterType.NUMBER, key);

    if (store === null) {
        return error(EMISSINGSTORE);
    }

    if (store.storeType === "optionlist" || !isStringFilter(store)) {
        return error(ESTORETYPE);
    }

    return value((strAPI.current ??= { filterStore: store, parentChannelName: api.parentChannelName }));
}
