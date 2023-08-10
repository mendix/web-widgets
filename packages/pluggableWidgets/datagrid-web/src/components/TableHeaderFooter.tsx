import { createElement, Fragment, ReactNode, PropsWithChildren, ReactElement } from "react";
import { PagingPositionEnum } from "../../typings/DatagridProps";

interface TableHeaderProps extends PropsWithChildren {
    pagingPosition: PagingPositionEnum;
    pagination: ReactNode;
    headerTitle?: string;
}

export function TableHeader(props: TableHeaderProps): ReactElement | null {
    const { pagingPosition, pagination, children, headerTitle } = props;
    return (
        <Fragment>
            <div className="table-header">{(pagingPosition === "top" || pagingPosition === "both") && pagination}</div>
            {children && (
                <div className="header-filters" aria-label={headerTitle || undefined}>
                    {children}
                </div>
            )}
        </Fragment>
    );
}

interface TableFooterProps {
    pagingPosition: PagingPositionEnum;
    pagination: ReactNode;
}

export function TableFooter(props: TableFooterProps): ReactElement | null {
    const { pagingPosition, pagination } = props;
    return (
        <div className="table-footer">{(pagingPosition === "bottom" || pagingPosition === "both") && pagination}</div>
    );
}
