import { Alert } from "@mendix/widget-plugin-component-kit/Alert";
import { FC } from "react";

/**
 * @remark Any changes made in this hoc should be reflected in
 * 'withAttributeGuard' hoc as well.
 */
export function withAttrGuard<P extends { attr: { filterable: boolean } } | { refEntity: { filterable: boolean } }>(
    Component: FC<P>
): FC<P> {
    return function AttrGuard(props) {
        const meta = "attr" in props ? props.attr : props.refEntity;

        if (!meta.filterable) {
            return (
                <Alert bootstrapStyle="danger">
                    The attribute in the current widget configuration is{" "}
                    <a href="https://docs.mendix.com/refguide/attributes/#limitations">not filterable</a>. Please change
                    the widget configuration.
                </Alert>
            );
        }
        return <Component {...props} />;
    };
}
