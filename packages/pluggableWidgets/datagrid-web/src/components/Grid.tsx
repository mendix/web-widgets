import classNames from "classnames";
import { ReactElement, createElement } from "react";
import { PaginationEnum } from "../../typings/DatagridProps";
import { useInfiniteControl } from "@mendix/widget-plugin-grid/components/InfiniteBody";

type P = Omit<JSX.IntrinsicElements["div"], "role" | "ref">;

export interface GridProps extends P {
    paginationType: PaginationEnum;
    className?: string;
    hasMoreItems: boolean;
    setPage?: (update: (page: number) => number) => void;
}

export function Grid(props: GridProps): ReactElement {
    const { className, style, paginationType, hasMoreItems, setPage, children, ...rest } = props;
    const isInfinite = paginationType === "virtualScrolling";
    const [trackScrolling, bodySize, containerRef] = useInfiniteControl({
        hasMoreItems,
        isInfinite,
        setPage
    });

    return (
        <div
            className={classNames("widget-datagrid-grid table", { "infinite-loading": isInfinite }, className)}
            role="grid"
            {...rest}
            ref={containerRef}
            style={isInfinite && bodySize > 0 ? { ...style, maxHeight: bodySize } : style}
            onScroll={isInfinite ? trackScrolling : undefined}
        >
            {children}
        </div>
    );
}
