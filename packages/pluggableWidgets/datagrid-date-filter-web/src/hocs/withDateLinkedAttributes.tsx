import { createElement } from "react";
import { AttributeMetaData } from "mendix";
import { useFilterAPI } from "@mendix/widget-plugin-filtering/context";
import { APIError } from "@mendix/widget-plugin-filtering/errors";
import { error, value, Result } from "@mendix/widget-plugin-filtering/result-meta";
import { Date_InputFilterInterface } from "@mendix/widget-plugin-filtering/typings/InputFilterInterface";
import { Alert } from "@mendix/widget-plugin-component-kit/Alert";
import { useConst } from "@mendix/widget-plugin-mobx-kit/react/useConst";
import { useSetup } from "@mendix/widget-plugin-mobx-kit/react/useSetup";
import { DateStoreProvider } from "@mendix/widget-plugin-filtering/custom-filter-api/DateStoreProvider";
import { ISetupable } from "@mendix/widget-plugin-mobx-kit/setupable";

interface RequiredProps {
    attributes: Array<{
        attribute: AttributeMetaData<Date>;
    }>;
    name: string;
}

interface StoreProvider extends ISetupable {
    store: Date_InputFilterInterface;
}

type Component<P extends object> = (props: P) => React.ReactElement;

export function withDateLinkedAttributes<P extends RequiredProps>(
    component: Component<P & InjectableFilterAPI>
): Component<P> {
    const StoreInjector = withInjectedStore(component);

    return function FilterAPIProvider(props) {
        const api = useStoreProvider(props);

        if (api.hasError) {
            return <Alert bootstrapStyle="danger">{api.error.message}</Alert>;
        }

        return <StoreInjector {...props} {...api.value} />;
    };
}

function withInjectedStore<P extends object>(
    Component: Component<P & InjectableFilterAPI>
): Component<P & { provider: StoreProvider; channel: string }> {
    return function StoreInjector(props) {
        const provider = useSetup(() => props.provider);
        return <Component {...props} filterStore={provider.store} parentChannelName={props.channel} />;
    };
}

interface InjectableFilterAPI {
    filterStore: Date_InputFilterInterface;
    parentChannelName?: string;
}

function useStoreProvider(props: RequiredProps): Result<{ provider: StoreProvider; channel: string }, APIError> {
    const filterAPI = useFilterAPI();
    return useConst(() => {
        if (filterAPI.hasError) {
            return error(filterAPI.error);
        }

        return value({
            provider: new DateStoreProvider(filterAPI.value, {
                attributes: props.attributes.map(obj => obj.attribute),
                dataKey: props.name
            }),
            channel: filterAPI.value.parentChannelName
        });
    });
}
