import { useRef } from "react";
import { APIError, EGRPKEY, EMISSINGSTORE, ESTORETYPE } from "../errors";
import { FilterType, getFilterStore, useFilterContextValue } from "../context";
import { Result, error, value } from "../result-meta";
import { OptionListFilterInterface } from "../typings/OptionListFilterInterface";

export interface Select_FilterAPIv2 {
    filterStore: OptionListFilterInterface<string>;
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
        return error(EGRPKEY);
    }

    const store = getFilterStore(api.provider.value, FilterType.NUMBER, key);

    if (store === null) {
        return error(EMISSINGSTORE);
    }

    if (store.storeType !== "optionlist") {
        return error(ESTORETYPE);
    }

    return value((slctAPI.current ??= { filterStore: store, parentChannelName: api.parentChannelName }));
}
