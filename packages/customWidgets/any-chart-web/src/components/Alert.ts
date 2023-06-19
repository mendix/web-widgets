import { FunctionComponent, createElement, PropsWithChildren } from "react";
import * as classNames from "classnames";

export interface AlertProps {
    bootstrapStyle?: "default" | "primary" | "success" | "info" | "warning" | "danger";
    className?: string;
}

export const Alert: FunctionComponent<PropsWithChildren<AlertProps>> = props =>
    props.children
        ? createElement(
              "div",
              { className: classNames(`alert alert-${props.bootstrapStyle}`, props.className) },
              props.children
          )
        : null;

Alert.displayName = "Alert";
Alert.defaultProps = { bootstrapStyle: "danger" };
