import classNames from "classnames";
import { createElement, ReactNode, ReactElement } from "react";

type P = Omit<JSX.IntrinsicElements["div"], "ref">;

interface GalleryFooterProps extends P {
    children?: ReactNode;
}

export function GalleryFooter({ children, className, ...rest }: GalleryFooterProps): ReactElement {
    return (
        <div className={classNames("widget-gallery-footer", className)} {...rest}>
            {children}
        </div>
    );
}
