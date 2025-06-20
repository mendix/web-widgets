import { FilterAPI } from "@mendix/widget-plugin-filtering/context";
import { createElement, FC } from "react";
import { EnumStoreProvider } from "@mendix/widget-plugin-filtering/custom-filter-api/EnumStoreProvider";
import { useSetup } from "@mendix/widget-plugin-mobx-kit/react/useSetup";
import { AttributeMetaData } from "mendix";
import { EnumFilterProps } from "../components/typings";

interface RequiredProps {
    attr: AttributeMetaData<string | boolean>;
    name: string;
}

export function withLinkedEnumStore<P extends RequiredProps>(
    Component: FC<P & EnumFilterProps>
): FC<P & { filterAPI: FilterAPI }> {
    return function ProviderHost(props) {
        const { store } = useSetup(
            () => new EnumStoreProvider(props.filterAPI, { attributes: [props.attr], dataKey: props.name })
        );
        return <Component {...props} filterStore={store} parentChannelName={props.filterAPI.parentChannelName} />;
    };
}
