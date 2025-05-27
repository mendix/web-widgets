import { useRef } from "react";
import { FilterType, getFilterStore, useFilterContextValue } from "../context";
import { APIError, EMISSINGSTORE, EStoreTypeMisMatch, OPTIONS_NOT_FILTERABLE } from "../errors";
import { Result, error, value } from "../result-meta";
import { PickerFilterStore } from "../typings/PickerFilterStore";

export interface Select_FilterAPIv2 {
    filterStore: PickerFilterStore;
    parentChannelName?: string;
}

interface Props {
    filterable: boolean;
}

export function useSelectFilterAPI({ filterable }: Props): Result<Select_FilterAPIv2, APIError> {
    const ctx = useFilterContextValue();
    const slctAPI = useRef<Select_FilterAPIv2>();

    if (ctx.hasError) {
        return error(ctx.error);
    }

    const api = ctx.value;

    if (api.provider.hasError) {
        return error(api.provider.error);
    }

    const store = getFilterStore(api.provider.value, FilterType.ENUMERATION, "");

    if (store === null) {
        return error(EMISSINGSTORE);
    }

    if (store.storeType !== "select" && store.storeType !== "refselect") {
        return error(EStoreTypeMisMatch("dropdown filter", store.arg1.type));
    }

    if (store.storeType === "refselect") {
        const configurationConflict = filterable && store.optionsFilterable === false;
        if (configurationConflict) {
            return error(OPTIONS_NOT_FILTERABLE);
        }
    }

    return value((slctAPI.current ??= { filterStore: store, parentChannelName: api.parentChannelName }));
}
