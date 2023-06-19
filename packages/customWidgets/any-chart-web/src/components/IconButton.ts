import { FunctionComponent, createElement } from "react";
import classNames from "classnames";

export interface IconButtonProps {
    className?: string;
    glyphIcon: string;
    type?: "span" | "i" | "em";
    onClick?: () => void;
}

export const IconButton: FunctionComponent<IconButtonProps> = props =>
    createElement(props.type as string, {
        className: classNames("glyphicon", `glyphicon-${props.glyphIcon}`, props.className as string),
        onClick: props.onClick
    });

IconButton.defaultProps = { type: "i" };
IconButton.displayName = "IconButton";
