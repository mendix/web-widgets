import { Alert } from "@mendix/widget-plugin-component-kit/Alert";
import { useFilterContextValue } from "@mendix/widget-plugin-filtering";
import { createElement } from "react";
import { DatagridDateFilterContainerProps } from "../../typings/DatagridDateFilterProps";
import { APIv1Props, APIv2Props } from "../helpers/filter-api-client/types";
import { useFilterAPIClient } from "../helpers/filter-api-client/useFilterAPIClient";
import * as errors from "../helpers/filter-api-client/errors";

type APIv1Consumer = (props: APIv1Props) => React.ReactElement;

type APIv2Consumer = (props: APIv2Props) => React.ReactElement;

type APIv1Provider = (props: DatagridDateFilterContainerProps) => React.ReactElement;

type APIv2Provider = (props: APIv1Props) => React.ReactElement;

export function withAPIv1(Component: APIv1Consumer): APIv1Provider {
    return function APIv1Provider(props) {
        const apiv1 = useFilterContextValue();

        if (apiv1.hasError) {
            return <Alert bootstrapStyle="danger">{errors.EPLACE}</Alert>;
        }

        return <Component apiv1={apiv1.value} {...props} />;
    };
}

export function withAPIv2(Component: APIv2Consumer): APIv2Provider {
    return function APIv2Provider(props) {
        const { apiv1, ...rest } = props;
        const [error, client] = useFilterAPIClient(apiv1);

        if (error) {
            return <Alert bootstrapStyle="danger">{error.message}</Alert>;
        }

        return <Component filterAPIClient={client} {...rest} />;
    };
}
