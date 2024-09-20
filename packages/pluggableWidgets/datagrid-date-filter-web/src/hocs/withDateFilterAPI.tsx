import { Alert } from "@mendix/widget-plugin-component-kit/Alert";
import { useDateFilterAPI, Date_FilterAPIv2 } from "@mendix/widget-plugin-filtering/helpers/useDateFilterAPI";
import { createElement } from "react";

export function withDateFilterAPI<P extends object>(
    Component: (props: P & Date_FilterAPIv2) => React.ReactElement
): (props: P) => React.ReactElement {
    return function FilterAPIProvider(props) {
        const api = useDateFilterAPI("");

        if (api.hasError) {
            return <Alert bootstrapStyle="danger">{api.error.message}</Alert>;
        }

        return (
            <Component filterStore={api.value.filterStore} parentChannelName={api.value.parentChannelName} {...props} />
        );
    };
}
