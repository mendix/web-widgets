import { Alert } from "@mendix/widget-plugin-component-kit/Alert";
import { useFilterAPI } from "@mendix/widget-plugin-filtering/context";
import { APIError, EMISSINGSTORE, EStoreTypeMisMatch } from "@mendix/widget-plugin-filtering/errors";
import { error, Result, value } from "@mendix/widget-plugin-filtering/result-meta";
import { isDateFilter } from "@mendix/widget-plugin-filtering/stores/input/store-utils";
import { ReactElement, useRef } from "react";
import { DateFilterProps } from "../components/typings";

export function withParentProvidedDateStore<P>(
    Component: (props: P & DateFilterProps) => ReactElement
): (props: P) => ReactElement {
    return function FilterAPIProvider(props: P): ReactElement {
        const api = useDateFilterAPI();
        if (api.hasError) {
            return <Alert bootstrapStyle="danger">{api.error.message}</Alert>;
        }

        return (
            <Component {...props} filterStore={api.value.filterStore} parentChannelName={api.value.parentChannelName} />
        );
    };
}

export function useDateFilterAPI(): Result<DateFilterProps, APIError> {
    const ctx = useFilterAPI();
    const dateAPI = useRef<DateFilterProps | null>(null);

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

    if (store.storeType !== "input" || !isDateFilter(store)) {
        return error(EStoreTypeMisMatch("date filter", store.storeType !== "input" ? "select" : store.arg1.type));
    }

    return value((dateAPI.current ??= { filterStore: store, parentChannelName: api.parentChannelName }));
}
