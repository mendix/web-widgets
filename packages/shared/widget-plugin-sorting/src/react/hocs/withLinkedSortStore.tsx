import { ErrorBoundary } from "@mendix/widget-plugin-component-kit/ErrorBoundary";
import { useConst } from "@mendix/widget-plugin-mobx-kit/react/useConst";
import { useSetup } from "@mendix/widget-plugin-mobx-kit/react/useSetup";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { AttributeMetaData, DynamicValue } from "mendix";
import { observer } from "mobx-react-lite";
import { createElement, FC, useEffect } from "react";
import { SortStoreProvider } from "../../helpers/SortStoreProvider";
import { BasicSortStore } from "../../types/store";
import { SortAPI, useSortAPI } from "../context";

interface RequiredProps {
    attributes: Array<{
        attribute: AttributeMetaData;
        caption?: DynamicValue<string>;
    }>;
}

export function withSortAPI<P extends object>(Component: FC<P & { sortAPI: SortAPI }>): FC<P> {
    const SortAPIInjector = observer<P>(function SortAPIInjector(props) {
        const id = useConst(() => `SortAPIInjector@${generateUUID()}`);
        const sortAPI = useSortAPI();

        useEffect(() => sortAPI.host.useHost(id), [sortAPI.host, id]);

        if (sortAPI.host.usedBy !== null && sortAPI.host.usedBy !== id) {
            throw new Error(
                `SortAPI is already used by another component with id: ${sortAPI.host.usedBy}. Only one instance of Sort widget is allowed in header.`
            );
        }

        return <Component {...props} sortAPI={sortAPI} />;
    });

    return function (props): React.ReactElement {
        return (
            <ErrorBoundary>
                <SortAPIInjector {...props} />
            </ErrorBoundary>
        );
    };
}

export function withLinkedSortStore<P extends RequiredProps>(
    Component: FC<P & { sortStore: BasicSortStore }>
): FC<P & { sortAPI: SortAPI }> {
    return function SortStoreProviderHost(props) {
        const { store } = useSetup(
            () =>
                new SortStoreProvider({
                    host: props.sortAPI.host,
                    initSortOrder: props.sortAPI.initSortOrder,
                    attributes: props.attributes
                })
        );

        return <Component {...props} sortStore={store} />;
    };
}
