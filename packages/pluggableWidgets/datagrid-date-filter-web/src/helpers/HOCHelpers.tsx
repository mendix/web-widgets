import { Alert } from "@mendix/widget-plugin-component-kit/Alert";
import { useFilterContextValue } from "@mendix/widget-plugin-filtering";
import { Fragment, createElement, useRef } from "react";
import { DatagridDateFilterContainerProps } from "../../typings/DatagridDateFilterProps";
import { APIv1Props, APIv2Props } from "./component-types";
import { useFilterAPIClient } from "./filter-api-client/useFilterAPIClient";
import { isLoadingDefaultValues } from "../utils/widget-utils";

type FilterViewV1 = (props: APIv1Props) => React.ReactElement;

type APIv1Guard = (props: DatagridDateFilterContainerProps) => React.ReactElement;

export function withAPIv1(Component: FilterViewV1): APIv1Guard {
    return function APIv1Guard(props) {
        const apiv1 = useFilterContextValue();

        if (apiv1.hasError) {
            return <Alert bootstrapStyle="danger">{apiv1.error.message}</Alert>;
        }

        return <Component apiv1={apiv1.value} {...props} />;
    };
}

type FilterViewV2 = (props: APIv2Props) => React.ReactElement;

type APIv2Guard = (props: APIv1Props) => React.ReactElement;

export function withAPIv2(Component: FilterViewV2): APIv2Guard {
    return function APIv2Guard(props) {
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
