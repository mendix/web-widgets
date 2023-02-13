import { createElement, ReactElement } from "react";
import { WebIcon } from "mendix";
import classNames from "classnames";

export interface IconProps {
    icon: WebIcon | null;
    className?: string;
    fallback?: ReactElement;
}

export const Icon = ({ icon, className = "", fallback }: IconProps): ReactElement | null => {
    if (icon?.type === "glyph") {
        return <span className={classNames("glyphicon", className, icon.iconClass)} aria-hidden />;
    }
    if (icon?.type === "image") {
        return <img className={className} src={icon.iconUrl} aria-hidden alt="" />;
    }
    return fallback || null;
};

Icon.displayName = "Icon";
