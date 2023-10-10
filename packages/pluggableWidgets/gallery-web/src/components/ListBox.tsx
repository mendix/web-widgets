import classNames from "classnames";
import { createElement, ReactElement, ReactNode } from "react";

type P = Omit<JSX.IntrinsicElements["div"], "ref" | "role">;

interface ListBoxProps extends P {
    children?: ReactNode;
    lg: number;
    md: number;
    sm: number;
}

export function ListBox({ children, className, lg, md, sm, ...rest }: ListBoxProps): ReactElement {
    return (
        <div
            className={classNames(
                "widget-gallery-items",
                `widget-gallery-lg-${lg}`,
                `widget-gallery-md-${md}`,
                `widget-gallery-sm-${sm}`,
                className
            )}
            role="list"
            {...rest}
        >
            {children}
        </div>
    );
}
