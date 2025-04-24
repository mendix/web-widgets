import { Alert } from "@mendix/widget-plugin-component-kit/Alert";
import { type StaticSelectFilterStore } from "@mendix/widget-plugin-dropdown-filter/stores/StaticSelectFilterStore";
import { useRef, createElement } from "react";
import { useFilterAPI } from "../context";
import { APIError, EMISSINGSTORE, EStoreTypeMisMatch } from "../errors";
import { Result, error, value } from "../result-meta";

export interface Select_FilterAPIv2 {
    filterStore: StaticSelectFilterStore;
    parentChannelName?: string;
}

export function withParentProvidedStore<P extends { filterable: boolean }>(
    Component: (props: P & Select_FilterAPIv2) => React.ReactElement
): (props: P) => React.ReactElement {
    return function FilterAPIProvider(props: P): React.ReactElement {
        const api = useSelectFilterStore();
        if (api.hasError) {
            return <Alert bootstrapStyle="danger">{api.error.message}</Alert>;
        }

        return (
            <Component {...props} filterStore={api.value.filterStore} parentChannelName={api.value.parentChannelName} />
        );
    };
}

function useSelectFilterStore(): Result<Select_FilterAPIv2, APIError> {
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
