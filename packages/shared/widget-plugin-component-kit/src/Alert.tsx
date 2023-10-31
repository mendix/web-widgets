import { Children, createElement, ReactNode } from "react";
import classNames from "classnames";

export interface AlertProps {
    children?: ReactNode;
    className?: string;
    bootstrapStyle: "default" | "primary" | "success" | "info" | "warning" | "danger";
    role?: string;
}

export interface ValidationAlertProps {
    children?: ReactNode;
    className?: string;
}

// cloning from https://gitlab.rnd.mendix.com/appdev/appdev/-/blob/master/client/src/widgets/web/helpers/Alert.tsx
export const ValidationAlert = ({ className, children }: ValidationAlertProps): JSX.Element | null => (
    <Alert className={classNames("mx-validation-message", className)} bootstrapStyle="danger" role="alert">
        {children}
    </Alert>
);

export const Alert = ({ className, bootstrapStyle, children, role }: AlertProps): JSX.Element | null =>
    Children.count(children) > 0 ? (
        <div className={classNames(`alert alert-${bootstrapStyle}`, className)} role={role}>
            {children}
        </div>
    ) : null;

Alert.displayName = "Alert";
