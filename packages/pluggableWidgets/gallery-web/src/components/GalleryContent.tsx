import { InfiniteBodyProps, useInfiniteControl } from "@mendix/widget-plugin-grid/components/InfiniteBody";
import classNames from "classnames";
import { ReactElement, ReactNode, createElement } from "react";

type PickProps = "hasMoreItems" | "setPage" | "isInfinite";

export type GalleryContentProps = {
    className?: string;
    children?: ReactNode;
} & Pick<InfiniteBodyProps, PickProps>;

export function GalleryContent({
    children,
    className,
    hasMoreItems,
    isInfinite,
    setPage
}: GalleryContentProps): ReactElement {
    const [trackScrolling, bodySize, containerRef] = useInfiniteControl({
        hasMoreItems,
        isInfinite,
        setPage
    });

    return (
        <div
            className={classNames("widget-gallery-content", { "infinite-loading": isInfinite }, className)}
            ref={containerRef}
            onScroll={isInfinite ? trackScrolling : undefined}
            style={isInfinite && bodySize > 0 ? { maxHeight: bodySize } : undefined}
        >
            {children}
        </div>
    );
}
