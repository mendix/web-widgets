import { Alert } from "@mendix/widget-plugin-component-kit/Alert";
import { FC, createElement, useMemo } from "react";

interface RequiredProps {
    attributes: Array<{
        attribute: { filterable: boolean };
    }>;
}

export function withAttributeGuard<P extends RequiredProps>(Component: FC<P>): FC<P> {
    return function AttributesGuard(props) {
        const isValid = useMemo(
            () => props.attributes.every(({ attribute }) => attribute.filterable),
            [props.attributes]
        );

        if (!isValid) {
            return (
                <Alert bootstrapStyle="danger">
                    Only filterable attributes are allowed. One of the attributes in the current widget configuration is
                    not filterable. Please change the widget configuration.
                </Alert>
            );
        }
        return <Component {...props} />;
    };
}
