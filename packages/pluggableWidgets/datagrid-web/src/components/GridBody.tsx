import { useInfiniteControl } from "@mendix/widget-plugin-grid/components/InfiniteBody";
import classNames from "classnames";
import { createElement, Fragment, ReactElement } from "react";
import { LoadingTypeEnum, PaginationEnum } from "../../typings/DatagridProps";
import { SpinnerLoader } from "./loader/SpinnerLoader";
import { RowSkeletonLoader } from "./loader/RowSkeletonLoader";

interface Props {
    className?: string;
    children?: React.ReactNode;
    style?: React.CSSProperties;
    paginationType: PaginationEnum;
    hasMoreItems: boolean;
    setPage?: (update: (page: number) => number) => void;
    loadingType: LoadingTypeEnum;
    isLoading: boolean;
    isLoadingMore?: boolean;
    columnsHidable: boolean;
    columnsSize: number;
    rowsSize: number;
}

export function GridBody(props: Props): ReactElement {
    const { paginationType, setPage, hasMoreItems, style, children } = props;
    const isInfinite = paginationType === "virtualScrolling";
    const [trackScrolling, bodySize, containerRef] = useInfiniteControl({
        hasMoreItems,
        isInfinite,
        setPage
    });
    const baseClass = "widget-datagrid-grid-body table-content";

    const content = (): React.ReactElement => {
        if (props.isLoading) {
            return <Loader {...props} />;
        }
        return (
            <Fragment>
                {children}
                {props.isLoadingMore && <Loader {...props} />}
            </Fragment>
        );
    };

    return (
        <div
            ref={containerRef}
            className={classNames(baseClass, { "infinite-loading": isInfinite }, props.className)}
            role="rowgroup"
            onScroll={isInfinite ? trackScrolling : undefined}
            style={isInfinite && bodySize > 0 ? { ...style, maxHeight: bodySize } : style}
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
        />
    );
}
