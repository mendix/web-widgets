import { Alert } from "@mendix/widget-plugin-component-kit/Alert";
import { useFilterContextValue } from "@mendix/widget-plugin-filtering/provider";
import { createElement } from "react";
import { ENOCONTEXT, EMISSINGSTORE, ESTORETYPE } from "./errors";
import { Number_InputFilterInterface } from "@mendix/widget-plugin-filtering/typings/InputFilterInterface";
import { isNumberFilter } from "@mendix/widget-plugin-filtering/stores/store-utils";

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

        const store = ctx.value.store;

        if (store === null) {
            return <Alert bootstrapStyle="danger">{EMISSINGSTORE}</Alert>;
        }

        if (store.storeType === "optionlist" || !isNumberFilter(store)) {
            return <Alert bootstrapStyle="danger">{ESTORETYPE}</Alert>;
        }

        return <Component filterStore={store} parentChannelName={ctx.value.parentChannelName} {...props} />;
    };
}
