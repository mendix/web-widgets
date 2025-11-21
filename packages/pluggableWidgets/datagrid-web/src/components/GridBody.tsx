import { useInfiniteControl } from "@mendix/widget-plugin-grid/components/InfiniteBody";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { Fragment, PropsWithChildren, ReactElement, ReactNode, RefObject, UIEventHandler, useCallback } from "react";
import {
    useDatagridConfig,
    useItemCount,
    useLoaderViewModel,
    usePaginationService,
    useVisibleColumnsCount
} from "../model/hooks/injection-hooks";
import { RowSkeletonLoader } from "./loader/RowSkeletonLoader";
import { SpinnerLoader } from "./loader/SpinnerLoader";

export const GridBody = observer(function GridBody(props: PropsWithChildren): ReactElement {
    const { children } = props;
    const { bodySize, containerRef, isInfinite, handleScroll } = useBodyScroll();

    return (
        <div
            className={classNames("widget-datagrid-grid-body table-content", { "infinite-loading": isInfinite })}
            style={isInfinite && bodySize > 0 ? { maxHeight: `${bodySize}px` } : {}}
            role="rowgroup"
            ref={containerRef}
            onScroll={handleScroll}
        >
            <ContentGuard>{children}</ContentGuard>
        </div>
    );
});

const ContentGuard = observer(function ContentGuard(props: PropsWithChildren): ReactNode {
    const loaderVM = useLoaderViewModel();
    const { pageSize } = usePaginationService();
    const config = useDatagridConfig();
    const columnsCount = useVisibleColumnsCount().get();
    const itemCount = useItemCount().get();

    if (loaderVM.isFirstLoad && config.loadingType === "spinner") {
        return <Spinner />;
    }

    if (loaderVM.isFirstLoad) {
        return (
            <RowSkeletonLoader
                columnsHidable={config.columnsHidable}
                columnsSize={columnsCount}
                pageSize={itemCount > 0 ? itemCount : pageSize}
                useBorderTop
            />
        );
    }

    return (
        <Fragment>
            {props.children}
            {(() => {
                if (loaderVM.isFetchingNextBatch && config.loadingType === "spinner") {
                    return <Spinner />;
                }

                if (loaderVM.isFetchingNextBatch) {
                    return (
                        <RowSkeletonLoader
                            columnsHidable={config.columnsHidable}
                            columnsSize={columnsCount}
                            pageSize={pageSize}
                            useBorderTop={false}
                        />
                    );
                }

                return null;
            })()}
        </Fragment>
    );
});

function useBodyScroll(): {
    handleScroll: UIEventHandler<HTMLDivElement> | undefined;
    bodySize: number;
    containerRef: RefObject<HTMLDivElement | null>;
    isInfinite: boolean;
} {
    const paging = usePaginationService();
    const setPage = useCallback((cb: (n: number) => number) => paging.setPage(cb), [paging]);

    const isInfinite = paging.pagination === "virtualScrolling";
    const [trackScrolling, bodySize, containerRef] = useInfiniteControl({
        hasMoreItems: paging.hasMoreItems,
        isInfinite,
        setPage
    });

    return {
        handleScroll: isInfinite ? trackScrolling : undefined,
        bodySize,
        containerRef,
        isInfinite
    };
}

const Spinner = (): ReactNode => (
    <div className="widget-datagrid-loader-container">
        <SpinnerLoader withMargins size="large" />
    </div>
);
