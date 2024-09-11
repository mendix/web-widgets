import { Alert } from "@mendix/widget-plugin-component-kit/Alert";
import { String_FilterAPIv2, useStringFilterAPI } from "@mendix/widget-plugin-filtering/helpers/useStringFilterAPI";
import { createElement } from "react";

interface Props {
    groupKey: string;
}

export function withTextFilterAPI<P extends Props>(
    Component: (props: P & String_FilterAPIv2) => React.ReactElement
): (props: P) => React.ReactElement {
    return function FilterAPIProvider(props) {
        const api = useStringFilterAPI(props.groupKey);

        if (api.hasError) {
            return <Alert bootstrapStyle="danger">{api.error.message}</Alert>;
        }

        return (
            <Component filterStore={api.value.filterStore} parentChannelName={api.value.parentChannelName} {...props} />
        );
    };
}
