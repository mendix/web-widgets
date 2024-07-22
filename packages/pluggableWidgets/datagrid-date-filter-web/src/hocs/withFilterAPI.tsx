import { Alert } from "@mendix/widget-plugin-component-kit/Alert";
import { useFilterContextValue, getFilterStore } from "@mendix/widget-plugin-filtering/provider-next";
import { isDateFilter } from "@mendix/widget-plugin-filtering/stores/store-utils";
import { Date_InputFilterInterface } from "@mendix/widget-plugin-filtering/typings/InputFilterInterface";
import { createElement } from "react";
import * as errors from "./errors";
import { FilterType } from "@mendix/widget-plugin-filtering/provider";

interface Date_FilterAPIv2 {
    filterStore: Date_InputFilterInterface;
    parentChannelName?: string;
}

export function withDateFilterAPI<P>(
    Component: (props: P & Date_FilterAPIv2) => React.ReactElement
): (props: P) => React.ReactElement {
    return function FilterAPIProvider(props) {
        const ctx = useFilterContextValue();

        if (ctx.hasError) {
            return <Alert bootstrapStyle="danger">{errors.EPLACE}</Alert>;
        }

        if (ctx.value.version !== 2) {
            return <Alert bootstrapStyle="danger">Version 2 of filtering api is required.</Alert>;
        }

        const store = getFilterStore(ctx.value, FilterType.DATE, "undefined");

        if (store === null) {
            return <Alert bootstrapStyle="danger">{errors.EMISSINGSTORE}</Alert>;
        }

        if (store.storeType === "optionlist" || !isDateFilter(store)) {
            return <Alert bootstrapStyle="danger">{errors.ESTORETYPE}</Alert>;
        }

        return <Component filterStore={store} parentChannelName={ctx.value.parentChannelName} {...props} />;
    };
}
