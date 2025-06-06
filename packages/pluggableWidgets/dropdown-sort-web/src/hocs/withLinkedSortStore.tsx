import { Alert } from "@mendix/widget-plugin-component-kit/Alert";
import { useSetup } from "@mendix/widget-plugin-mobx-kit/react/useSetup";
import { SortAPI, useSortAPI } from "@mendix/widget-plugin-sorting/context";
import { SortStoreProvider } from "@mendix/widget-plugin-sorting/controllers/SortStoreProvider";
import { SortingStoreInterface } from "@mendix/widget-plugin-sorting/SortingStoreInterface";
import { AttributeMetaData, DynamicValue } from "mendix";
import { createElement, FC } from "react";

interface RequiredProps {
    attributes: Array<{
        attribute: AttributeMetaData;
        caption?: DynamicValue<string>;
    }>;
    name: string;
}

export function withSortAPI<P>(Component: FC<P & { sortAPI: SortAPI }>): FC<P> {
    return function SortAPIProvider(props) {
        const sortAPI = useSortAPI();
        if (sortAPI.hasError) {
            return <Alert bootstrapStyle="danger">{sortAPI.error.message}</Alert>;
        }
        return <Component {...props} sortAPI={sortAPI.value} />;
    };
}

export function withLinkedSortStore<P extends RequiredProps>(
    Component: FC<P & { sortStore: SortingStoreInterface }>
): FC<P & { sortAPI: SortAPI }> {
    return function SortStoreProviderHost(props) {
        const { store } = useSetup(
            () =>
                new SortStoreProvider(props.sortAPI.sortObserver, {
                    options: props.attributes,
                    name: props.name
                })
        );

        return <Component {...props} sortStore={store} />;
    };
}
