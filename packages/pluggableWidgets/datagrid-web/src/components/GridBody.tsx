import { InfiniteBodyProps, useInfiniteControl } from "@mendix/widget-plugin-grid/components/InfiniteBody";
import classNames from "classnames";
import { createElement, ReactElement, ReactNode } from "react";
import { PaginationEnum } from "../../typings/DatagridProps";

type Props = Omit<JSX.IntrinsicElements["div"], "ref"> & {
    children?: ReactNode;
    paginationType: PaginationEnum;
    isLoading: boolean;
} & Pick<InfiniteBodyProps, PickProps>;

type PickProps = "hasMoreItems" | "setPage" | "isInfinite";

export function GridBody(props: Props): ReactElement {
    const { isInfinite, paginationType, setPage, hasMoreItems, style, children } = props;
    const [trackScrolling, bodySize, containerRef] = useInfiniteControl({
        hasMoreItems,
        isInfinite,
        setPage
    });

    return (
        <div
            ref={containerRef}
            className={classNames(
                "widget-datagrid-grid-body table-content",
                { "infinite-loading": isInfinite },
                props.className
            )}
            role="rowgroup"
            onScroll={isInfinite && paginationType !== "loadMore" ? trackScrolling : undefined}
            style={isInfinite && bodySize > 0 ? { ...style, maxHeight: bodySize } : style}
        >
            {children}
        </div>
    );
}
