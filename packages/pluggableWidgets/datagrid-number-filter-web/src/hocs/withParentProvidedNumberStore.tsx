import { Alert } from "@mendix/widget-plugin-component-kit/Alert";
import { useFilterAPI } from "@mendix/widget-plugin-filtering/context";
import { APIError, EMISSINGSTORE, EStoreTypeMisMatch } from "@mendix/widget-plugin-filtering/errors";
import { error, Result, value } from "@mendix/widget-plugin-filtering/result-meta";
import { isNumberFilter } from "@mendix/widget-plugin-filtering/stores/input/store-utils";
import { ReactElement, useRef } from "react";
import { NumberFilterProps } from "../components/typings";

export function withParentProvidedNumberStore<P>(
    Component: (props: P & NumberFilterProps) => ReactElement
): (props: P) => ReactElement {
    return function FilterAPIProvider(props: P): ReactElement {
        const api = useNumberFilterAPI();
        if (api.hasError) {
            return <Alert bootstrapStyle="danger">{api.error.message}</Alert>;
        }

        return (
            <Component {...props} filterStore={api.value.filterStore} parentChannelName={api.value.parentChannelName} />
        );
    };
}

export function useNumberFilterAPI(): Result<NumberFilterProps, APIError> {
    const ctx = useFilterAPI();
    const numberAPI = useRef<NumberFilterProps>(undefined);

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

    if (store.storeType !== "input" || !isNumberFilter(store)) {
        return error(EStoreTypeMisMatch("number filter", store.storeType !== "input" ? "select" : store.arg1.type));
    }

    return value((numberAPI.current ??= { filterStore: store, parentChannelName: api.parentChannelName }));
}
