import classNames from "classnames";
import { createElement, ReactElement } from "react";

type GalleryFooterProps = Omit<JSX.IntrinsicElements["div"], "ref">;

export function GalleryFooter({ children, className, ...rest }: GalleryFooterProps): ReactElement {
    return (
        <div className={classNames("widget-gallery-footer", className)} {...rest}>
            {children}
        </div>
    );
}
