import { Alert } from "@mendix/widget-plugin-component-kit/Alert";
import { Number_InputFilterInterface, isNumberFilter, useFilterContextValue } from "@mendix/widget-plugin-filtering";
import { createElement } from "react";
import { ENOCONTEXT, EMISSINGSTORE, ESTORETYPE } from "./errors";

type NumberFilterAPI = {
    filterStore: Number_InputFilterInterface;
    parentChannelName?: string;
};

export function withNumberFilterAPI<T>(
    Component: (props: T & NumberFilterAPI) => React.ReactElement
): (props: T) => React.ReactElement {
    return function FilterAPIProvider(props) {
        const apiv2 = useFilterContextValue();

        if (apiv2.hasError) {
            return <Alert bootstrapStyle="danger">{ENOCONTEXT}</Alert>;
        }

        const store = apiv2.value.store;

        if (store === null) {
            return <Alert bootstrapStyle="danger">{EMISSINGSTORE}</Alert>;
        }

        if (store.storeType === "optionlist" || !isNumberFilter(store)) {
            return <Alert bootstrapStyle="danger">{ESTORETYPE}</Alert>;
        }

        return <Component filterStore={store} parentChannelName={apiv2.value.eventsChannelName} {...props} />;
    };
}
