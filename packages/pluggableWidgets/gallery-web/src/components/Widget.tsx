import { createElement, ReactElement, ReactNode } from "react";
import { InfiniteBody } from "@mendix/widget-plugin-grid/components/InfiniteBody";
import { Pagination } from "@mendix/widget-plugin-grid/components/Pagination";
import { ObjectItem } from "mendix";
import classNames from "classnames";
import { WidgetRoot } from "./WidgetRoot";
import { WidgetTopBar } from "./WidgetTopBar";
import { WidgetHeader } from "./WidgetHeader";
import { WidgetFooter } from "./WidgetFooter";

export interface GalleryProps<T extends ObjectItem> {
    className?: string;
    desktopItems: number;
    emptyPlaceholderRenderer?: (renderWrapper: (children: ReactNode) => ReactElement) => ReactElement;
    emptyMessageTitle?: string;
    header?: ReactNode;
    headerTitle?: string;
    showHeader: boolean;
    hasMoreItems: boolean;
    items: T[];
    itemRenderer: (
        renderWrapper: (
            selected: boolean,
            children: ReactNode,
            className?: string,
            onClick?: () => void
        ) => ReactElement,
        item: T
    ) => ReactNode;
    numberOfItems?: number;
    paging: boolean;
    page: number;
    pageSize: number;
    paginationPosition?: "below" | "above";
    preview?: boolean;
    phoneItems: number;
    setPage?: (computePage: (prevPage: number) => number) => void;
    tabletItems: number;
    tabIndex?: number;
}

export function Gallery<T extends ObjectItem>(props: GalleryProps<T>): ReactElement {
    const pagination = props.paging ? (
        <div className="widget-gallery-pagination">
            <Pagination
                canNextPage={props.hasMoreItems}
                canPreviousPage={props.page !== 0}
                gotoPage={(page: number) => props.setPage && props.setPage(() => page)}
                nextPage={() => props.setPage && props.setPage(prev => prev + 1)}
                numberOfItems={props.numberOfItems}
                page={props.page}
                pageSize={props.pageSize}
                previousPage={() => props.setPage && props.setPage(prev => prev - 1)}
            />
        </div>
    ) : null;

    const showTopBar = props.paging && props.paginationPosition === "above";
    const showHeader = props.showHeader ?? false;
    const showFooter = props.paging && props.paginationPosition === "below";

    return (
        <WidgetRoot className={props.className} selectable={false} data-focusindex={props.tabIndex || 0}>
            {showTopBar && <WidgetTopBar>{pagination}</WidgetTopBar>}
            {showHeader && <WidgetHeader headerTitle={props.headerTitle}>{props.header}</WidgetHeader>}
            {props.items.length > 0 && props.itemRenderer && (
                <InfiniteBody
                    className={classNames(
                        "widget-gallery-items",
                        `widget-gallery-lg-${props.desktopItems}`,
                        `widget-gallery-md-${props.tabletItems}`,
                        `widget-gallery-sm-${props.phoneItems}`
                    )}
                    hasMoreItems={props.hasMoreItems}
                    setPage={props.setPage}
                    isInfinite={!props.paging}
                    role="list"
                >
                    {props.items.map(item =>
                        props.itemRenderer((selected, children, className, onClick) => {
                            return (
                                <div
                                    key={`item_${item.id}`}
                                    className={classNames("widget-gallery-item", className, {
                                        "widget-gallery-clickable": !!onClick,
                                        "widget-gallery-selected": selected
                                    })}
                                    onClick={onClick}
                                    onKeyDown={
                                        onClick
                                            ? e => {
                                                  if (e.key === "Enter" || e.key === " ") {
                                                      e.preventDefault();
                                                      onClick();
                                                  }
                                              }
                                            : undefined
                                    }
                                    role={onClick ? "button" : "listitem"}
                                    tabIndex={onClick ? 0 : undefined}
                                >
                                    {children}
                                </div>
                            );
                        }, item)
                    )}
                </InfiniteBody>
            )}
            {(props.items.length === 0 || props.preview) &&
                props.emptyPlaceholderRenderer &&
                props.emptyPlaceholderRenderer(children => (
                    <div className="widget-gallery-empty" role="section" aria-label={props.emptyMessageTitle}>
                        <div className="empty-placeholder">{children}</div>
                    </div>
                ))}
            {showFooter && <WidgetFooter>{pagination}</WidgetFooter>}
        </WidgetRoot>
    );
}
