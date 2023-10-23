import { Children, createElement, ReactNode } from "react";
import classNames from "classnames";

export interface AlertProps {
    children?: ReactNode;
    className?: string;
    bootstrapStyle: "default" | "primary" | "success" | "info" | "warning" | "danger";
}

// cloning from https://gitlab.rnd.mendix.com/appdev/appdev/-/blob/master/client/src/widgets/web/helpers/Alert.tsx
export const ValidationAlert = ({ className, bootstrapStyle, children }: AlertProps): JSX.Element | null =>
    Children.count(children) > 0 ? (
        <div className={classNames(`alert alert-${bootstrapStyle} mx-validation-message`, className)} role="alert">
            {children}
        </div>
    ) : null;

export const Alert = ({ className, bootstrapStyle, children }: AlertProps): JSX.Element | null =>
    Children.count(children) > 0 ? (
        <div className={classNames(`alert alert-${bootstrapStyle}`, className)}>{children}</div>
    ) : null;

Alert.displayName = "Alert";
