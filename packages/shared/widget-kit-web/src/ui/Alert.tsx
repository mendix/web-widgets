import classNames from "classnames";
import { createElement, ReactNode, Children } from "react";

export interface AlertProps {
    children?: ReactNode;
    className?: string;
    bootstrapStyle: "default" | "primary" | "success" | "info" | "warning" | "danger";
}

export function Alert({ className, bootstrapStyle, children }: AlertProps): JSX.Element | null {
    return Children.count(children) > 0 ? (
        <div className={classNames(`alert alert-${bootstrapStyle}`, className)}>{children}</div>
    ) : null;
}
