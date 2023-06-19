import { createElement, FC, PropsWithChildren } from "react";
import classNames from "classnames";

export interface AlertProps extends PropsWithChildren {
    bootstrapStyle?: "default" | "primary" | "success" | "info" | "warning" | "danger";
    className?: string;
}

export const Alert: FC<AlertProps> = ({ bootstrapStyle, className, children }) =>
    children ? <div className={classNames(`alert alert-${bootstrapStyle}`, className)}>{children}</div> : null;

Alert.displayName = "Alert";
Alert.defaultProps = { bootstrapStyle: "danger" };
