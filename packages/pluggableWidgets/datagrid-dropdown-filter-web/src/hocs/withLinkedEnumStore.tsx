import { createElement } from "react";
import { Alert } from "@mendix/widget-plugin-component-kit/Alert";
import { ISetupable } from "@mendix/widget-plugin-mobx-kit/setupable";
import { useConst } from "@mendix/widget-plugin-mobx-kit/react/useConst";
import { useFilterAPI } from "@mendix/widget-plugin-filtering/context";
import { APIError } from "@mendix/widget-plugin-filtering/errors";
import { Result, value, error } from "@mendix/widget-plugin-filtering/result-meta";
import { StaticSelectFilterStore } from "@mendix/widget-plugin-dropdown-filter/stores/StaticSelectFilterStore";
import { EnumStoreProvider } from "@mendix/widget-plugin-filtering/custom-filter-api/EnumStoreProvider";
import { AttributeMetaData } from "mendix";
import { useSetup } from "@mendix/widget-plugin-mobx-kit/react/useSetup";
import { EnumFilterAPI } from "../components/typings";

interface StoreProvider extends ISetupable {
    store: StaticSelectFilterStore;
}

interface RequiredProps {
    attr: AttributeMetaData<string | boolean>;
    name: string;
}

type Component<P extends object> = (props: P) => React.ReactElement;

export function withLinkedEnumStore<P extends RequiredProps>(Cmp: Component<P & EnumFilterAPI>): Component<P> {
    function ProviderHost(props: P & { provider: StoreProvider; channel: string }): React.ReactElement {
        useSetup(() => props.provider);
        return <Cmp {...props} filterStore={props.provider.store} parentChannelName={props.channel} />;
    }

    return function FilterAPIProvider(props) {
        const api = useEnumStoreProvider(props);

        if (api.hasError) {
            return <Alert bootstrapStyle="danger">{api.error.message}</Alert>;
        }

        return <ProviderHost {...props} provider={api.value.provider} channel={api.value.channel} />;
    };
}

function useEnumStoreProvider(props: RequiredProps): Result<{ provider: StoreProvider; channel: string }, APIError> {
    const filterAPI = useFilterAPI();
    return useConst(() => {
        if (filterAPI.hasError) {
            return error(filterAPI.error);
        }

        return value({
            provider: new EnumStoreProvider(filterAPI.value, {
                attributes: [props.attr],
                dataKey: props.name
            }),
            channel: filterAPI.value.parentChannelName
        });
    });
}
