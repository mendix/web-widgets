import { createElement, ReactElement } from "react";
import classNames from "classnames";
import { WebIcon } from "mendix";

export interface IconInternalProps {
    icon: WebIcon | null;
    className?: string;
    fallback?: ReactElement;
}

export const IconInternal = ({ icon, className = "", fallback }: IconInternalProps): ReactElement | null => {
    if (icon?.type === "glyph") {
        return <span className={classNames("glyphicon", className, icon.iconClass)} aria-hidden />;
    }
    if (icon?.type === "image") {
        return <img className={className} src={icon.iconUrl} aria-hidden alt="" />;
    }
    if (icon?.type === "icon") {
        return <span className={classNames(className, icon.iconClass)} aria-hidden />;
    }
    return fallback || null;
};

IconInternal.displayName = "IconInternal";
