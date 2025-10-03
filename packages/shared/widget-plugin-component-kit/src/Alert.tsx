import { Children, createElement, ReactElement, ReactNode } from "react";
import classNames from "classnames";

export interface AlertProps {
    children?: ReactNode;
    className?: string;
    bootstrapStyle: "default" | "primary" | "success" | "info" | "warning" | "danger";
    inputElementId?: string;
    role?: string;
}

export interface ValidationAlertProps {
    children?: ReactNode;
    className?: string;
    referenceId?: string;
}

// cloning from https://gitlab.rnd.mendix.com/appdev/appdev/-/blob/master/client/src/widgets/web/helpers/Alert.tsx
export const ValidationAlert = ({ className, children, referenceId }: ValidationAlertProps): ReactElement => (
    <Alert
        className={classNames("mx-validation-message", className)}
        bootstrapStyle="danger"
        role="alert"
        inputElementId={referenceId}
    >
        {children}
    </Alert>
);

export const Alert = ({ className, bootstrapStyle, children, role, inputElementId }: AlertProps): ReactNode =>
    Children.count(children) > 0 ? (
        <div
            className={classNames(`alert alert-${bootstrapStyle}`, className)}
            role={role}
            {...(inputElementId ? { id: inputElementId + "-error" } : undefined)}
        >
            {children}
        </div>
    ) : null;

Alert.displayName = "Alert";
