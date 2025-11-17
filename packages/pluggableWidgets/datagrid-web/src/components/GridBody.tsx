import { useInfiniteControl } from "@mendix/widget-plugin-grid/components/InfiniteBody";
import classNames from "classnames";
import { Fragment, ReactElement, ReactNode, useCallback } from "react";
import { LoadingTypeEnum } from "../../typings/DatagridProps";
import { usePaginationService } from "../model/hooks/injection-hooks";
import { RowSkeletonLoader } from "./loader/RowSkeletonLoader";
import { SpinnerLoader } from "./loader/SpinnerLoader";

interface Props {
    className?: string;
    children?: ReactNode;
    loadingType: LoadingTypeEnum;
    isFirstLoad: boolean;
    isFetchingNextBatch?: boolean;
    columnsHidable: boolean;
    columnsSize: number;
    rowsSize: number;
}

export function GridBody(props: Props): ReactElement {
    const { children } = props;

    const paging = usePaginationService();
    const pageSize = paging.pageSize;
    const setPage = useCallback((cb: (n: number) => number) => paging.setPage(cb), [paging]);

    const isInfinite = paging.pagination === "virtualScrolling";
    const [trackScrolling, bodySize, containerRef] = useInfiniteControl({
        hasMoreItems: paging.hasMoreItems,
        isInfinite,
        setPage
    });

    const content = (): ReactElement => {
        if (props.isFirstLoad) {
            return <Loader {...props} rowsSize={props.rowsSize > 0 ? props.rowsSize : pageSize} />;
        }
        return (
            <Fragment>
                {children}
                {props.isFetchingNextBatch && <Loader {...props} rowsSize={pageSize} useBorderTop={false} />}
            </Fragment>
        );
    };

    return (
        <div
            className={classNames(
                "widget-datagrid-grid-body table-content",
                { "infinite-loading": isInfinite },
                props.className
            )}
            style={isInfinite && bodySize > 0 ? { maxHeight: `${bodySize}px` } : {}}
            role="rowgroup"
            ref={containerRef}
            onScroll={isInfinite ? trackScrolling : undefined}
        >
            {content()}
        </div>
    );
}

interface LoaderProps {
    loadingType: LoadingTypeEnum;
    columnsHidable: boolean;
    columnsSize: number;
    rowsSize: number;
    useBorderTop?: boolean;
}

function Loader(props: LoaderProps): ReactElement {
    if (props.loadingType === "spinner") {
        return (
            <div className="widget-datagrid-loader-container">
                <SpinnerLoader withMargins size="large" />
            </div>
        );
    }

    return (
        <RowSkeletonLoader
            columnsHidable={props.columnsHidable}
            columnsSize={props.columnsSize}
            pageSize={props.rowsSize}
            useBorderTop={props.useBorderTop}
        />
    );
}
