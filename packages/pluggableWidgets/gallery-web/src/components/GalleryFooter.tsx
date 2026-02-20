import { PropsWithChildren, ReactElement } from "react";

export function GalleryFooter({ children }: PropsWithChildren<{ className?: string }>): ReactElement {
    return <div className={"widget-gallery-footer"}>{children}</div>;
}
