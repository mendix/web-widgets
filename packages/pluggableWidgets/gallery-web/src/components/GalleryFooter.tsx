import classNames from "classnames";
import { createElement, ReactNode, ReactElement } from "react";

type P = Omit<JSX.IntrinsicElements["div"], "ref">;

interface WidgetFooterProps extends P {
    children?: ReactNode;
}

export function WidgetFooter({ children, className, ...rest }: WidgetFooterProps): ReactElement {
    return (
        <div className={classNames("widget-gallery-footer", className)} {...rest}>
            {children}
        </div>
    );
}
