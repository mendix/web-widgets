import { Alert } from "@mendix/widget-plugin-component-kit/Alert";
import { useFilterContextValue, getFilterStore, FilterType } from "@mendix/widget-plugin-filtering/provider-next";
import { createElement } from "react";
import { ENOCONTEXT, EMISSINGSTORE, ESTORETYPE } from "./errors";
import { String_InputFilterInterface } from "@mendix/widget-plugin-filtering/typings/InputFilterInterface";
import { isStringFilter } from "@mendix/widget-plugin-filtering/stores/store-utils";

type Text_FilterAPIv2 = {
    filterStore: String_InputFilterInterface;
    parentChannelName?: string;
};

export function withTextFilterAPI<T>(
    Component: (props: T & Text_FilterAPIv2) => React.ReactElement
): (props: T) => React.ReactElement {
    return function FilterAPIProvider(props) {
        const ctx = useFilterContextValue();

        if (ctx.hasError) {
            return <Alert bootstrapStyle="danger">{ENOCONTEXT}</Alert>;
        }

        if (ctx.value.version !== 2) {
            return <Alert bootstrapStyle="danger">Version 2 of filtering api is required.</Alert>;
        }

        const store = getFilterStore(ctx.value, FilterType.STRING, "undefined");

        if (store === null) {
            return <Alert bootstrapStyle="danger">{EMISSINGSTORE}</Alert>;
        }

        if (store.storeType === "optionlist" || !isStringFilter(store)) {
            return <Alert bootstrapStyle="danger">{ESTORETYPE}</Alert>;
        }

        return <Component filterStore={store} parentChannelName={ctx.value.parentChannelName} {...props} />;
    };
}
