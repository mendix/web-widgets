import { Alert } from "@mendix/widget-plugin-component-kit/Alert";
import { useFilterContextValue, getFilterStore, FilterType } from "@mendix/widget-plugin-filtering/provider-next";
import { createElement } from "react";
import { OptionListFilterInterface } from "@mendix/widget-plugin-filtering/typings/OptionListFilterInterface";

export interface Select_FilterAPIv2 {
    filterStore: OptionListFilterInterface<string>;
    parentChannelName?: string;
}

export function withSelectFilterAPI<T extends Select_FilterAPIv2>(
    Component: (props: T) => React.ReactElement
): (props: Omit<T, "filterStore">) => React.ReactElement {
    return function FilterAPIProvider(props: T): React.ReactElement {
        const ctx = useFilterContextValue();

        if (ctx.hasError) {
            return <Alert bootstrapStyle="danger">Error</Alert>;
        }

        const store = getFilterStore(ctx.value, FilterType.ENUMERATION, "undefined");

        if (store === null || store.storeType === "input") {
            return <Alert bootstrapStyle="danger">Store error</Alert>;
        }

        return <Component {...props} filterStore={store} />;
    };
}
