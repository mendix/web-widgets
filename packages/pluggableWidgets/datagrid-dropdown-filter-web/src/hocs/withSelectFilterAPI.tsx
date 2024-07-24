import { Alert } from "@mendix/widget-plugin-component-kit/Alert";
import { Select_FilterAPIv2, useSelectFilterAPI } from "@mendix/widget-plugin-filtering/helpers/useSelectFilterAPI";
import { createElement } from "react";

interface Props {
    groupKey: string;
}

export { Select_FilterAPIv2 };

export function withSelectFilterAPI<P extends Props>(
    Component: (props: P & Select_FilterAPIv2) => React.ReactElement
): (props: P) => React.ReactElement {
    return function FilterAPIProvider(props: P): React.ReactElement {
        const api = useSelectFilterAPI(props.groupKey);
        if (api.hasError) {
            return <Alert bootstrapStyle="danger">{api.error.message}</Alert>;
        }

        return <Component {...props} filterStore={api.value.filterStore} />;
    };
}
