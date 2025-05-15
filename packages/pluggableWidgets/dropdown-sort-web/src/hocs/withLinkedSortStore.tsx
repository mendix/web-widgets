import { DynamicValue, AttributeMetaData } from "mendix";
import { Alert } from "@mendix/widget-plugin-component-kit/Alert";
import { createElement } from "react";
import { SortingStoreInterface } from "@mendix/widget-plugin-sorting/SortingStoreInterface";
import { useSetup } from "@mendix/widget-plugin-mobx-kit/react/useSetup";
import { SortAPI, useSortAPI } from "@mendix/widget-plugin-sorting/context";
import { SortStoreProvider } from "@mendix/widget-plugin-sorting/controllers/SortStoreProvider";

interface RequiredProps {
    attributes: Array<{
        attribute: AttributeMetaData;
        caption?: DynamicValue<string>;
    }>;
    name: string;
}

export function withSortAPI<P>(
    Component: (props: P & { sortAPI: SortAPI }) => React.ReactElement
): (props: P) => React.ReactElement {
    return function SortAPIProvider(props: P) {
        const sortAPI = useSortAPI();
        if (sortAPI.hasError) {
            return <Alert bootstrapStyle="danger">{sortAPI.error.message}</Alert>;
        }
        return <Component {...props} sortAPI={sortAPI.value} />;
    };
}

export function withLinkedSortStore<P extends RequiredProps>(
    Component: (props: P & { sortStore: SortingStoreInterface }) => React.ReactElement
): (props: P & { sortAPI: SortAPI }) => React.ReactElement {
    return function SortStoreInjector(props: P & { sortAPI: SortAPI }) {
        const provider = useSetup(
            () =>
                new SortStoreProvider(props.sortAPI.sortObserver, {
                    options: props.attributes,
                    name: props.name
                })
        );

        return <Component {...props} sortStore={provider.store} />;
    };
}
