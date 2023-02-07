import { SFC, createElement } from "react";
import * as classNames from "classnames";

export interface IconButtonProps {
    className?: string;
    glyphIcon: string;
    type?: "span" | "i" | "em";
    onClick?: () => void;
}

export const IconButton: SFC<IconButtonProps> = ({ className, glyphIcon, onClick, type }) =>
    createElement(type as string, {
        className: classNames("glyphicon", `glyphicon-${glyphIcon}`, className),
        onClick
    });

IconButton.defaultProps = { type: "i" };
IconButton.displayName = "IconButton";
