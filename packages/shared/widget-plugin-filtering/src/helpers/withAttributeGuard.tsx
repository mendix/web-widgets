import { Alert } from "@mendix/widget-plugin-component-kit/Alert";
import { FC, useMemo } from "react";

interface RequiredProps {
    attributes: Array<{
        attribute: { filterable: boolean };
    }>;
}

/**
 * @remark Any changes made in this hoc should be reflected in
 * 'withAttrGuard' hoc as well.
 */
export function withAttributeGuard<P extends RequiredProps>(Component: FC<P>): FC<P> {
    return function AttributesGuard(props) {
        const isValid = useMemo(
            () => props.attributes.every(({ attribute }) => attribute.filterable),
            [props.attributes]
        );

        if (!isValid) {
            return (
                <Alert bootstrapStyle="danger">
                    The attributes in the current widget configuration are{" "}
                    <a href="https://docs.mendix.com/refguide/attributes/#limitations">not filterable</a>. Please change
                    the widget configuration.
                </Alert>
            );
        }
        return <Component {...props} />;
    };
}
