import { Alert } from "@mendix/widget-plugin-component-kit/Alert";
import { createElement } from "react";
import { Number_FilterAPIv2, useNumberFilterAPI } from "@mendix/widget-plugin-filtering/helpers/useNumberFilterAPI";

interface Props {
    groupKey: string;
}

export function withNumberFilterAPI<P extends Props>(
    Component: (props: P & Number_FilterAPIv2) => React.ReactElement
): (props: P) => React.ReactElement {
    return function FilterAPIProvider(props) {
        const api = useNumberFilterAPI(props.groupKey);

        if (api.hasError) {
            return <Alert bootstrapStyle="danger">{api.error.message}</Alert>;
        }

        return (
            <Component filterStore={api.value.filterStore} parentChannelName={api.value.parentChannelName} {...props} />
        );
    };
}
