import { useInfiniteControl } from "@mendix/widget-plugin-grid/components/InfiniteBody";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { PropsWithChildren, ReactElement } from "react";
import { usePaginationConfig, usePaginationVM } from "../model/hooks/injection-hooks";

export const GalleryContent = observer(function GalleryContent({ children }: PropsWithChildren): ReactElement {
    const paginationVM = usePaginationVM();
    const isInfinite = usePaginationConfig().isVirtualScrolling;
    const [trackScrolling, bodySize, containerRef] = useInfiniteControl({
        hasMoreItems: paginationVM.hasMoreItems,
        isInfinite,
        setPage: paginationVM.setPage.bind(paginationVM)
    });

    return (
        <div
            className={classNames("widget-gallery-content", { "infinite-loading": isInfinite })}
            ref={containerRef}
            onScroll={isInfinite ? trackScrolling : undefined}
            style={isInfinite && bodySize > 0 ? { maxHeight: bodySize } : undefined}
        >
            {children}
        </div>
    );
});
