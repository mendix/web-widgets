import { FilterAPI } from "@mendix/widget-plugin-filtering/context";
import { DateStoreProvider } from "@mendix/widget-plugin-filtering/custom-filter-api/DateStoreProvider";
import { useSetup } from "@mendix/widget-plugin-mobx-kit/react/useSetup";
import { AttributeMetaData } from "mendix";
import { FC } from "react";
import { DateFilterProps } from "../components/typings";

interface RequiredProps {
    attributes: Array<{
        attribute: AttributeMetaData<Date>;
    }>;
    name: string;
}

export function withLinkedDateStore<P extends RequiredProps>(
    Component: FC<P & DateFilterProps>
): FC<P & { filterAPI: FilterAPI }> {
    return function DateStoreProviderHost(props) {
        const { store } = useSetup(
            () =>
                new DateStoreProvider(props.filterAPI, {
                    attributes: props.attributes.map(obj => obj.attribute),
                    dataKey: props.name
                })
        );
        return <Component {...props} filterStore={store} parentChannelName={props.filterAPI.parentChannelName} />;
    };
}
