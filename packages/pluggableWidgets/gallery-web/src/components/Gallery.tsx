import { Pagination } from "@mendix/widget-plugin-grid/components/Pagination";
import { KeyNavProvider } from "@mendix/widget-plugin-grid/keyboard-navigation/context";
import { FocusTargetController } from "@mendix/widget-plugin-grid/keyboard-navigation/FocusTargetController";
import { PositionInGrid, SelectActionHandler } from "@mendix/widget-plugin-grid/selection";
import { ObjectItem } from "mendix";
import { createElement, ReactElement, ReactNode } from "react";
import { GalleryItemHelper } from "../typings/GalleryItem";
import { ListBox } from "./ListBox";
import { ListItem } from "./ListItem";
import { GalleryContent } from "./GalleryContent";
import { GalleryFooter } from "./GalleryFooter";
import { GalleryHeader } from "./GalleryHeader";
import { GalleryRoot } from "./GalleryRoot";
import { GalleryTopBar } from "./GalleryTopBar";

import { ItemEventsController } from "../typings/ItemEventsController";

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
    numberOfItems?: number;
    paging: boolean;
    page: number;
    pageSize: number;
    paginationPosition?: "below" | "above";
    showEmptyStatePreview?: boolean;
    phoneItems: number;
    setPage?: (computePage: (prevPage: number) => number) => void;
    style?: React.CSSProperties;
    tabletItems: number;
    tabIndex?: number;
    ariaLabelListBox?: string;
    preview?: boolean;

    // Helpers
    focusController: FocusTargetController;
    itemEventsController: ItemEventsController;
    itemHelper: GalleryItemHelper;
    selectHelper: SelectActionHandler;
    getPosition: (index: number) => PositionInGrid;
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
                pagination={props.paging ? "buttons" : "virtualScrolling"}
            />
        </div>
    ) : null;

    const showTopBar = props.paging && props.paginationPosition === "above";
    const showFooter = props.paging && props.paginationPosition === "below";

    return (
        <GalleryRoot
            className={props.className}
            style={props.style}
            selectable={false}
            data-focusindex={props.tabIndex || 0}
        >
            {showTopBar && <GalleryTopBar>{pagination}</GalleryTopBar>}
            {props.showHeader && <GalleryHeader aria-label={props.headerTitle}>{props.header}</GalleryHeader>}
            <GalleryContent hasMoreItems={props.hasMoreItems} setPage={props.setPage} isInfinite={!props.paging}>
                {props.items.length > 0 && (
                    <ListBox
                        lg={props.desktopItems}
                        md={props.tabletItems}
                        sm={props.phoneItems}
                        selectionType={props.selectHelper.selectionType}
                        aria-label={props.ariaLabelListBox}
                    >
                        <KeyNavProvider focusController={props.focusController}>
                            {props.items.map((item, index) => (
                                <ListItem
                                    preview={props.preview}
                                    key={`item_${item.id}`}
                                    helper={props.itemHelper}
                                    item={item}
                                    selectHelper={props.selectHelper}
                                    eventsController={props.itemEventsController}
                                    getPosition={props.getPosition}
                                    itemIndex={index}
                                />
                            ))}
                        </KeyNavProvider>
                    </ListBox>
                )}
            </GalleryContent>
            {(props.items.length === 0 || props.showEmptyStatePreview) &&
                props.emptyPlaceholderRenderer &&
                props.emptyPlaceholderRenderer(children => (
                    <section className="widget-gallery-empty" aria-label={props.emptyMessageTitle}>
                        <div className="empty-placeholder">{children}</div>
                    </section>
                ))}
            {showFooter && <GalleryFooter>{pagination}</GalleryFooter>}
        </GalleryRoot>
    );
}
