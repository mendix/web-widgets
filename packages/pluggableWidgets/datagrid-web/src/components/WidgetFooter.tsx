import { createElement, ReactNode, ReactElement } from "react";
import { PagingPositionEnum } from "../../typings/DatagridProps";

interface WidgetFooterProps {
    pagingPosition: PagingPositionEnum;
    pagination: ReactNode;
}

export function WidgetFooter(props: WidgetFooterProps): ReactElement | null {
    const { pagingPosition, pagination } = props;
    return (
        <div className="widget-datagrid-footer table-footer">
            {(pagingPosition === "bottom" || pagingPosition === "both") && pagination}
        </div>
    );
}
