import { Alert } from "@mendix/widget-plugin-component-kit/Alert";
import { Select_FilterAPIv2, useSelectFilterAPI } from "@mendix/widget-plugin-filtering/helpers/useSelectFilterAPI";
import { createElement } from "react";

export { Select_FilterAPIv2 };

export function withSelectFilterAPI<P extends { filterable: boolean }>(
    Component: (props: P & Select_FilterAPIv2) => React.ReactElement
): (props: P) => React.ReactElement {
    return function FilterAPIProvider(props: P): React.ReactElement {
        const api = useSelectFilterAPI(props);
        if (api.hasError) {
            return <Alert bootstrapStyle="danger">{api.error.message}</Alert>;
        }

        return (
            <Component {...props} filterStore={api.value.filterStore} parentChannelName={api.value.parentChannelName} />
        );
    };
}
