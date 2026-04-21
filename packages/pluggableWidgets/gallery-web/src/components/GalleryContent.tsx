import { useInfiniteControl } from "@mendix/widget-plugin-grid/components/InfiniteBody";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { PropsWithChildren, ReactElement } from "react";
import { useLoaderViewModel, usePaginationConfig, usePaginationVM } from "../model/hooks/injection-hooks";

export const GalleryContent = observer(function GalleryContent({ children }: PropsWithChildren): ReactElement {
    const paginationVM = usePaginationVM();
    const loaderVM = useLoaderViewModel();
    const isInfinite = usePaginationConfig().isVirtualScrolling;
    const [trackScrolling, bodySize, containerRef] = useInfiniteControl({
        hasMoreItems: paginationVM.hasMoreItems,
        isInfinite,
        isRefreshing: loaderVM.isRefreshing,
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
