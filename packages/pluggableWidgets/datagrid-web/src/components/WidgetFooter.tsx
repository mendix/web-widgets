import { createElement, ReactNode, ReactElement } from "react";
import { PagingPositionEnum } from "../../typings/DatagridProps";

type WidgetFooterProps = {
    pagingPosition: PagingPositionEnum;
    pagination: ReactNode;
} & JSX.IntrinsicElements["div"];

export function WidgetFooter(props: WidgetFooterProps): ReactElement | null {
    const { pagingPosition, pagination, ...rest } = props;
    return (
        <div {...rest} className="widget-datagrid-footer table-footer">
            {(pagingPosition === "bottom" || pagingPosition === "both") && pagination}
        </div>
    );
}
