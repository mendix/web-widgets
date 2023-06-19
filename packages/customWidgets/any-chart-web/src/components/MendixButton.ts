import { FunctionComponent, createElement, PropsWithChildren } from "react";
import * as classNames from "classnames";
import { IconButton } from "./IconButton";

type BootstrapStyle = "default" | "primary" | "success" | "info" | "warning" | "danger";

export interface MendixButtonProps {
    style?: BootstrapStyle;
    className?: string;
    glyphIcon?: string;
    onClick: () => void;
    disabled?: boolean;
}

export const MendixButton: FunctionComponent<PropsWithChildren<MendixButtonProps>> = ({
    style,
    className,
    disabled,
    glyphIcon,
    onClick,
    children
}) =>
    createElement(
        "button",
        {
            className: classNames(`mx-button btn btn-${style}`, className, { disabled }),
            onClick
        },
        glyphIcon ? createElement(IconButton, { type: "span", glyphIcon }) : null,
        children
    );

MendixButton.displayName = "MendixButton";
MendixButton.defaultProps = {
    disabled: false,
    style: "default"
};
