import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { Fragment, PropsWithChildren, ReactElement, ReactNode } from "react";
import {
    useDatagridConfig,
    useItemCount,
    useLoaderViewModel,
    usePaginationVM,
    useVisibleColumnsCount
} from "../model/hooks/injection-hooks";
import { useBodyScroll } from "../model/hooks/useBodyScroll";
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
    const { pageSize } = usePaginationVM();
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

const Spinner = (): ReactNode => (
    <div className="widget-datagrid-loader-container">
        <SpinnerLoader withMargins size="large" />
    </div>
);
