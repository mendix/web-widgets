import classNames from "classnames";
import { PropsWithChildren, ReactElement } from "react";

export function GalleryFooter({ children, className }: PropsWithChildren<{ className?: string }>): ReactElement {
    return <div className={classNames("widget-gallery-footer", className)}>{children}</div>;
}
