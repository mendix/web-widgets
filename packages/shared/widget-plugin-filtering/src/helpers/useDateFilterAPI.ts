import { useRef } from "react";
import { FilterType, getFilterStore, useFilterContextValue } from "../provider-next";
import { error, value, Result } from "../result-meta";
import { Date_InputFilterInterface } from "../typings/InputFilterInterface";
import { APIError, EGRPKEY, EMISSINGSTORE, ESTORETYPE } from "../errors";
import { isDateFilter } from "../stores/store-utils";

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
        return error(EGRPKEY);
    }

    const store = getFilterStore(api.provider.value, FilterType.NUMBER, key);

    if (store === null) {
        return error(EMISSINGSTORE);
    }

    if (store.storeType === "optionlist" || !isDateFilter(store)) {
        return error(ESTORETYPE);
    }

    return value((dateAPI.current ??= { filterStore: store, parentChannelName: api.parentChannelName }));
}
