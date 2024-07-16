import { Alert } from "@mendix/widget-plugin-component-kit/Alert";
import { Date_InputFilterInterface, isDateFilter, useFilterContextValue } from "@mendix/widget-plugin-filtering";
import { createElement } from "react";
import * as errors from "../helpers/filter-api-client/errors";

interface Date_FilterAPIv2 {
    filterStore: Date_InputFilterInterface;
    parentChannelName?: string;
}

export function withDateFilterAPI<P>(
    Component: (props: P & Date_FilterAPIv2) => React.ReactElement
): (props: P) => React.ReactElement {
    return function FilterAPIProvider(props) {
        const apiv2 = useFilterContextValue();

        if (apiv2.hasError) {
            return <Alert bootstrapStyle="danger">{errors.EPLACE}</Alert>;
        }

        const store = apiv2.value.store;

        if (store === null) {
            return <Alert bootstrapStyle="danger">{errors.EMISSINGSTORE}</Alert>;
        }

        if (store.storeType === "optionlist" || !isDateFilter(store)) {
            return <Alert bootstrapStyle="danger">{errors.ESTORETYPE}</Alert>;
        }

        return <Component filterStore={store} parentChannelName={apiv2.value.eventsChannelName} {...props} />;
    };
}
