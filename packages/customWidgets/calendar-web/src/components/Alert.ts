import { createElement, FunctionComponent, PropsWithChildren } from "react";
import classNames from "classnames";

export interface AlertProps {
    bootstrapStyle?: "default" | "primary" | "success" | "info" | "warning" | "danger";
    className?: string;
}

export const Alert: FunctionComponent<PropsWithChildren<AlertProps>> = ({ bootstrapStyle, className, children }) =>
    children
        ? createElement("div", { className: classNames(`alert alert-${bootstrapStyle}`, className) }, children)
        : null;

Alert.displayName = "Alert";
Alert.defaultProps = { bootstrapStyle: "danger" };
