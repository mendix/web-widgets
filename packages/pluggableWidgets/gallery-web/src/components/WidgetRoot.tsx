import classNames from "classnames";
import { ReactElement, createElement } from "react";

type P = Omit<JSX.IntrinsicElements["div"], "ref">;

export interface WidgetRootProps extends P {
    className?: string;
    selectable?: boolean;
    tabIndex?: number;
}

export function WidgetRoot(props: WidgetRootProps): ReactElement {
    const { className, selectable, children, ...rest } = props;

    return (
        <div
            data-focusindex={props.tabIndex || 0}
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
