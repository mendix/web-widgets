import classNames from "classnames";
import { ReactElement, createElement } from "react";

type P = Omit<JSX.IntrinsicElements["div"], "ref">;

export interface WidgetRootProps extends P {
    className?: string;
    selectable?: boolean;
}

export function WidgetRoot(props: WidgetRootProps): ReactElement {
    const { className, selectable, children, ...rest } = props;

    return (
        <div
            className={classNames(
                "widget-gallery",
                {
                    "widget-gallery-selectable": selectable
                },
                className
            )}
            {...rest}
        >
            {children}
        </div>
    );
}
