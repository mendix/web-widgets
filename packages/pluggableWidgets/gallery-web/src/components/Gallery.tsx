import { Pagination } from "@mendix/widget-plugin-grid/components/Pagination";
import { ListOptionSelectionProps } from "@mendix/widget-plugin-grid/selection/useListOptionSelectionProps";
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
    itemHelper: GalleryItemHelper;
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
    selectionProps: ListOptionSelectionProps;
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
        <GalleryRoot className={props.className} selectable={false} data-focusindex={props.tabIndex || 0}>
            {showTopBar && <GalleryTopBar>{pagination}</GalleryTopBar>}
            {showHeader && <GalleryHeader headerTitle={props.headerTitle}>{props.header}</GalleryHeader>}
            <GalleryContent hasMoreItems={props.hasMoreItems} setPage={props.setPage} isInfinite={!props.paging}>
                {props.items.length > 0 && (
                    <ListBox
                        lg={props.desktopItems}
                        md={props.tabletItems}
                        sm={props.phoneItems}
                        selectionType={props.selectionProps.selectionType}
                        multiselectable={props.selectionProps.multiselectable}
                    >
                        {props.items.map(item => (
                            <ListItem
                                key={`item_${item.id}`}
                                helper={props.itemHelper}
                                item={item}
                                selectionProps={props.selectionProps}
                            />
                        ))}
                    </ListBox>
                )}
            </GalleryContent>
            {(props.items.length === 0 || props.preview) &&
                props.emptyPlaceholderRenderer &&
                props.emptyPlaceholderRenderer(children => (
                    <div className="widget-gallery-empty" role="section" aria-label={props.emptyMessageTitle}>
                        <div className="empty-placeholder">{children}</div>
                    </div>
                ))}
            {showFooter && <GalleryFooter>{pagination}</GalleryFooter>}
        </GalleryRoot>
    );
}
