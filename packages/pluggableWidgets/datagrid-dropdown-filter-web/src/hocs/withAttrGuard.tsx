import { Alert } from "@mendix/widget-plugin-component-kit/Alert";
import { FC, createElement } from "react";

export function withAttrGuard<P extends { attr: { filterable: boolean } } | { refEntity: { filterable: boolean } }>(
    Component: FC<P>
): FC<P> {
    return function AttrGuard(props) {
        const meta = "attr" in props ? props.attr : props.refEntity;

        if (!meta.filterable) {
            return (
                <Alert bootstrapStyle="danger">
                    Only filterable attributes are allowed. The attributes in the current widget configuration is not
                    filterable. Please change the widget configuration.
                </Alert>
            );
        }
        return <Component {...props} />;
    };
}
