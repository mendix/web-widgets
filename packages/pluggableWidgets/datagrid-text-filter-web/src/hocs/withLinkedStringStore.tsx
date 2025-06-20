import { FilterAPI } from "@mendix/widget-plugin-filtering/context";
import { StringStoreProvider } from "@mendix/widget-plugin-filtering/custom-filter-api/StringStoreProvider";
import { useSetup } from "@mendix/widget-plugin-mobx-kit/react/useSetup";
import { AttributeMetaData } from "mendix";
import { createElement, FC } from "react";
import { StringFilterProps } from "../components/typings";

interface RequiredProps {
    attributes: Array<{
        attribute: AttributeMetaData<string>;
    }>;
    name: string;
}

export function withLinkedStringStore<P extends RequiredProps>(
    Component: FC<P & StringFilterProps>
): FC<P & { filterAPI: FilterAPI }> {
    return function StringStoreProviderHost(props) {
        const { store } = useSetup(
            () =>
                new StringStoreProvider(props.filterAPI, {
                    attributes: props.attributes.map(obj => obj.attribute),
                    dataKey: props.name
                })
        );
        return <Component {...props} filterStore={store} parentChannelName={props.filterAPI.parentChannelName} />;
    };
}
