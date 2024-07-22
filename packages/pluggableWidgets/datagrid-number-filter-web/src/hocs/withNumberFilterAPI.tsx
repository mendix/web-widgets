import { Alert } from "@mendix/widget-plugin-component-kit/Alert";
import { useFilterContextValue, FilterStore } from "@mendix/widget-plugin-filtering/provider-next";
import { createElement } from "react";
import { ENOCONTEXT, EMISSINGSTORE, ESTORETYPE } from "./errors";
import { Number_InputFilterInterface } from "@mendix/widget-plugin-filtering/typings/InputFilterInterface";
import { isNumberFilter } from "@mendix/widget-plugin-filtering/stores/store-utils";
import { FilterType } from "@mendix/widget-plugin-filtering/provider";

type NumberFilterAPI = {
    filterStore: Number_InputFilterInterface;
    parentChannelName?: string;
};

export function withNumberFilterAPI<T>(
    Component: (props: T & NumberFilterAPI) => React.ReactElement
): (props: T) => React.ReactElement {
    return function FilterAPIProvider(props) {
        const ctx = useFilterContextValue();

        if (ctx.hasError) {
            return <Alert bootstrapStyle="danger">{ENOCONTEXT}</Alert>;
        }

        if (ctx.value.version !== 2) {
            return <Alert bootstrapStyle="danger">Version 2 of filtering api is required.</Alert>;
        }

        const provider = ctx.value.provider;

        let store: FilterStore = null;
        if (provider.type === "direct") {
            store = provider.store;
        } else if (provider.type === "legacy") {
            store = provider.get(FilterType.NUMBER);
        }

        if (store === null) {
            return <Alert bootstrapStyle="danger">{EMISSINGSTORE}</Alert>;
        }

        if (store.storeType === "optionlist" || !isNumberFilter(store)) {
            return <Alert bootstrapStyle="danger">{ESTORETYPE}</Alert>;
        }

        return <Component filterStore={store} parentChannelName={ctx.value.parentChannelName} {...props} />;
    };
}
