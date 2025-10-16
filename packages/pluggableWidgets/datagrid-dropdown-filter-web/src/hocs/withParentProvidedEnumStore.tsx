import { Alert } from "@mendix/widget-plugin-component-kit/Alert";
import { ReactElement, useRef } from "react";
import { useFilterAPI } from "@mendix/widget-plugin-filtering/context";
import { APIError, EMISSINGSTORE, EStoreTypeMisMatch } from "@mendix/widget-plugin-filtering/errors";
import { error, Result, value } from "@mendix/widget-plugin-filtering/result-meta";
import { EnumFilterProps } from "../components/typings";

export function withParentProvidedEnumStore<P extends { filterable: boolean }>(
    Component: (props: P & EnumFilterProps) => ReactElement
): (props: P) => ReactElement {
    return function FilterAPIProvider(props: P): ReactElement {
        const api = useEnumFilterAPI();
        if (api.hasError) {
            return <Alert bootstrapStyle="danger">{api.error.message}</Alert>;
        }

        return (
            <Component {...props} filterStore={api.value.filterStore} parentChannelName={api.value.parentChannelName} />
        );
    };
}

function useEnumFilterAPI(): Result<EnumFilterProps, APIError> {
    const ctx = useFilterAPI();
    const slctAPI = useRef<EnumFilterProps | undefined>(undefined);

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
