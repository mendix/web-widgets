import { Pagination } from "@mendix/widget-plugin-grid/components/Pagination";
import classNames from "classnames";
import { ObjectItem } from "mendix";
import { createElement, ReactElement, ReactNode } from "react";
import { ListBox } from "./ListBox";
import { WidgetContent } from "./WidgetContent";
import { WidgetFooter } from "./WidgetFooter";
import { WidgetHeader } from "./WidgetHeader";
import { WidgetRoot } from "./WidgetRoot";
import { WidgetTopBar } from "./WidgetTopBar";

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
            <WidgetContent hasMoreItems={props.hasMoreItems} setPage={props.setPage} isInfinite={!props.paging}>
                {props.items.length > 0 && (
                    <ListBox lg={props.desktopItems} md={props.tabletItems} sm={props.phoneItems}>
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
                    </ListBox>
                )}
            </WidgetContent>
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
