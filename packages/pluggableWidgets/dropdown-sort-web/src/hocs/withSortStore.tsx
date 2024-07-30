import { Alert } from "@mendix/widget-plugin-component-kit/Alert";
import { createElement } from "react";
import { SortingStoreInterface } from "@mendix/widget-plugin-sorting/typings";
import { useSortingStore } from "@mendix/widget-plugin-sorting/helpers/useSortingStore";

export function withSortStore<P>(
    Component: (props: P & { sortStore: SortingStoreInterface }) => React.ReactElement
): (props: P) => React.ReactElement {
    return function SortStoreProvider(props: P) {
        const store = useSortingStore();
        if (store.hasError) {
            return <Alert bootstrapStyle="danger">{store.error.message}</Alert>;
        }
        return <Component {...props} sortStore={store.value} />;
    };
}
