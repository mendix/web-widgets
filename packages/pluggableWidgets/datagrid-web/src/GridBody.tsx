import { observer } from "mobx-react-lite";
import { Fragment, PropsWithChildren, ReactElement, ReactNode } from "react";
import { useDatagridConfig, useItemCount, useVisibleColumnsCount } from "./features/core/tokens";
import { SpinnerLoader } from "./features/datasource/loader/SpinnerLoader";
import { useLoaderViewModel } from "./features/datasource/tokens";
import { useGridSizeStore, usePaginationVM } from "./features/pagination/tokens";
import { RowSkeletonLoader } from "./RowSkeletonLoader";

export const GridBody = observer(function GridBody(props: PropsWithChildren): ReactElement {
    const { children } = props;
    const gridSizeStore = useGridSizeStore();

    return (
        <div className={"widget-datagrid-grid-body table-content"} role="rowgroup" ref={gridSizeStore.gridBodyRef}>
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
