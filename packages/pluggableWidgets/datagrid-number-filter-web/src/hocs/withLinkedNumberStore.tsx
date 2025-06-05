import { FilterAPI } from "@mendix/widget-plugin-filtering/context";
import { NumberStoreProvider } from "@mendix/widget-plugin-filtering/custom-filter-api/NumberStoreProvider";
import { useSetup } from "@mendix/widget-plugin-mobx-kit/react/useSetup";
import { Big } from "big.js";
import { AttributeMetaData } from "mendix";
import { createElement, FC } from "react";
import { NumberFilterProps } from "../components/typings";

interface RequiredProps {
    attributes: Array<{
        attribute: AttributeMetaData<Big>;
    }>;
    name: string;
}

export function withLinkedNumberStore<P extends RequiredProps>(
    Component: FC<P & NumberFilterProps>
): FC<P & { filterAPI: FilterAPI }> {
    return function NumberStoreProviderHost(props) {
        const { store } = useSetup(
            () =>
                new NumberStoreProvider(props.filterAPI, {
                    attributes: props.attributes.map(obj => obj.attribute),
                    dataKey: props.name
                })
        );
        return <Component {...props} filterStore={store} parentChannelName={props.filterAPI.parentChannelName} />;
    };
}
