import { useInfiniteControl } from "@mendix/widget-plugin-grid/components/InfiniteBody";
import classNames from "classnames";
import { Fragment, ReactElement, ReactNode } from "react";
import { LoadingTypeEnum, PaginationEnum } from "../../typings/DatagridProps";
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
    pageSize: number;
    pagination: PaginationEnum;
    hasMoreItems: boolean;
    setPage?: (update: (page: number) => number) => void;
}

export function GridBody(props: Props): ReactElement {
    const { children, pagination, hasMoreItems, setPage } = props;

    const isInfinite = pagination === "virtualScrolling";
    const [trackScrolling, bodySize, containerRef] = useInfiniteControl({
        hasMoreItems,
        isInfinite,
        setPage
    });

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
            {((): ReactElement => {
                if (props.isFirstLoad) {
                    return <Loader {...props} rowsSize={props.rowsSize > 0 ? props.rowsSize : props.pageSize} />;
                }
                return (
                    <Fragment>
                        {children}
                        {props.isFetchingNextBatch && (
                            <Loader {...props} rowsSize={props.pageSize} useBorderTop={false} />
                        )}
                    </Fragment>
                );
            })()}
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
