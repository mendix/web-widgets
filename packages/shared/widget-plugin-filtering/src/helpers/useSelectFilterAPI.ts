import { PickerFilterStore } from "@mendix/widget-plugin-dropdown-filter/typings/PickerFilterStore";
import { useRef } from "react";
import { useFilterAPI } from "../context";
import { APIError, EMISSINGSTORE, EStoreTypeMisMatch } from "../errors";
import { Result, error, value } from "../result-meta";

export interface Select_FilterAPIv2 {
    filterStore: PickerFilterStore;
    parentChannelName?: string;
}

export function useSelectFilterAPI(): Result<Select_FilterAPIv2, APIError> {
    const ctx = useFilterAPI();
    const slctAPI = useRef<Select_FilterAPIv2>();

    if (ctx.hasError) {
        return error(ctx.error);
    }

    const api = ctx.value;

    if (api.provider.hasError) {
        return error(api.provider.error);
    }

    const store = api.provider.value.type === "direct" ? api.provider.value.store : null;

    if (store === null) {
        return error(EMISSINGSTORE);
    }

    if (store.storeType !== "select") {
        return error(EStoreTypeMisMatch("dropdown filter", store.arg1.type));
    }

    return value((slctAPI.current ??= { filterStore: store, parentChannelName: api.parentChannelName }));
}
