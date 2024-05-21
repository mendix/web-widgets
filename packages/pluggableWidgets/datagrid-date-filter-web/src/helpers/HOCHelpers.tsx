import { Alert } from "@mendix/widget-plugin-component-kit/Alert";
import { useFilterContextValue } from "@mendix/widget-plugin-filtering";
import { Fragment, createElement, useRef } from "react";
import { DatagridDateFilterContainerProps } from "../../typings/DatagridDateFilterProps";
import { APIv1Props, APIv2Props } from "./component-types";
import { useFilterAPIClient } from "./filter-api-client/useFilterAPIClient";
import { isLoadingDefaultValues } from "../utils/widget-utils";

type ComponentAPIv1 = (props: APIv1Props) => React.ReactElement;

type ComponentAPIv2 = (props: APIv2Props) => React.ReactElement;

type APIv1Provider = (props: DatagridDateFilterContainerProps) => React.ReactElement;

type APIv2Provider = (props: APIv1Props) => React.ReactElement;

export function withAPIv1(Component: ComponentAPIv1): APIv1Provider {
    return function APIv1Provider(props) {
        const apiv1 = useFilterContextValue();

        if (apiv1.hasError) {
            return <Alert bootstrapStyle="danger">{apiv1.error.message}</Alert>;
        }

        return <Component apiv1={apiv1.value} {...props} />;
    };
}

export function withAPIv2(Component: ComponentAPIv2): APIv2Provider {
    return function APIv2Provider(props) {
        const { apiv1, ...rest } = props;
        const [error, client] = useFilterAPIClient(apiv1);

        if (error) {
            return <Alert bootstrapStyle="danger">{error.message}</Alert>;
        }

        return <Component filterAPIClient={client} {...rest} />;
    };
}

export function withPreloader<P extends DatagridDateFilterContainerProps>(
    Component: (props: P) => React.ReactElement
): (props: P) => React.ReactElement {
    return function Preloader(props) {
        const isLoaded = (useRef(false).current ||= !isLoadingDefaultValues(props));
        return isLoaded ? <Component {...props} /> : <Fragment />;
    };
}
