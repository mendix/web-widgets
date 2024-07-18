import { Alert } from "@mendix/widget-plugin-component-kit/Alert";
import { useFilterContextValue } from "@mendix/widget-plugin-filtering/provider";
import { isDateFilter } from "@mendix/widget-plugin-filtering/stores/store-utils";
import { Date_InputFilterInterface } from "@mendix/widget-plugin-filtering/typings/InputFilterInterface";
import { createElement } from "react";
import * as errors from "./errors";

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
