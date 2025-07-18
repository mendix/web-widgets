import { useSetup } from "@mendix/widget-plugin-mobx-kit/react/useSetup";
import { AttributeMetaData, DynamicValue } from "mendix";
import { createElement, FC } from "react";
import { SortStoreProvider } from "../../helpers/SortStoreProvider";
import { BasicSortStore } from "../../types/store";
import { SortAPI } from "../context";

interface RequiredProps {
    attributes: Array<{
        attribute: AttributeMetaData;
        caption?: DynamicValue<string>;
    }>;
}

export function withLinkedSortStore<P extends RequiredProps>(
    Component: FC<P & { sortStore: BasicSortStore }>
): FC<P & { sortAPI: SortAPI }> {
    return function SortStoreProviderHost(props) {
        const { store } = useSetup(
            () =>
                new SortStoreProvider({
                    host: props.sortAPI.host,
                    initSortOrder: props.sortAPI.host.sortOrder,
                    attributes: props.attributes
                })
        );

        return <Component {...props} sortStore={store} />;
    };
}
