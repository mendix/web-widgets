import { createElement, Fragment, ReactNode, PropsWithChildren, ReactElement } from "react";
import { PagingPositionEnum } from "../../typings/DatagridProps";

interface WidgetHeaderProps extends PropsWithChildren {
    pagingPosition: PagingPositionEnum;
    pagination: ReactNode;
    headerTitle?: string;
}

export function WidgetHeader(props: WidgetHeaderProps): ReactElement | null {
    const { pagingPosition, pagination, children, headerTitle } = props;
    return (
        <Fragment>
            <div className="widget-datagrid-header table-header">
                {(pagingPosition === "top" || pagingPosition === "both") && pagination}
            </div>
            {children && (
                <div className="widget-datagrid-header-filters header-filters" aria-label={headerTitle || undefined}>
                    {children}
                </div>
            )}
        </Fragment>
    );
}
