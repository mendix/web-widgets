import { Pagination } from "@mendix/widget-plugin-grid/components/Pagination";
import { ListOptionSelectionProps } from "@mendix/widget-plugin-grid/selection/useListOptionSelectionProps";
import { ObjectItem } from "mendix";
import { createElement, ReactElement, ReactNode } from "react";
import { KeyNavProvider } from "@mendix/widget-plugin-grid/keyboard-navigation/context";
import { GalleryItemHelper } from "../typings/GalleryItem";
import { ListBox } from "./ListBox";
import { ListItem } from "./ListItem";
import { GalleryContent } from "./GalleryContent";
import { GalleryFooter } from "./GalleryFooter";
import { GalleryHeader } from "./GalleryHeader";
import { GalleryRoot } from "./GalleryRoot";
import { GalleryTopBar } from "./GalleryTopBar";
import { useGridPositions } from "src/features/keyboard-navigation/useGridPositions";

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
    showEmptyStatePreview?: boolean;
    phoneItems: number;
    setPage?: (computePage: (prevPage: number) => number) => void;
    tabletItems: number;
    tabIndex?: number;
    selectionProps: ListOptionSelectionProps;
    ariaLabelListBox?: string;
}

export function Gallery<T extends ObjectItem>(props: GalleryProps<T>): ReactElement {
    const { columnSize, rowSize, getPosition } = useGridPositions({
        desktopItems: props.desktopItems,
        phoneItems: props.phoneItems,
        tabletItems: props.tabletItems,
        totalItems: props.items.length ?? 0
    });

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
    const showFooter = props.paging && props.paginationPosition === "below";

    return (
        <GalleryRoot className={props.className} selectable={false} data-focusindex={props.tabIndex || 0}>
            {showTopBar && <GalleryTopBar>{pagination}</GalleryTopBar>}
            {props.showHeader && <GalleryHeader aria-label={props.headerTitle}>{props.header}</GalleryHeader>}
            <GalleryContent hasMoreItems={props.hasMoreItems} setPage={props.setPage} isInfinite={!props.paging}>
                {props.items.length > 0 && (
                    <ListBox
                        lg={props.desktopItems}
                        md={props.tabletItems}
                        sm={props.phoneItems}
                        selectionType={props.selectionProps.selectionType}
                        aria-label={props.ariaLabelListBox}
                    >
                        <KeyNavProvider rows={rowSize} columns={columnSize} pageSize={props.pageSize}>
                            {props.items.map((item, index) => (
                                <ListItem
                                    key={`item_${item.id}`}
                                    helper={props.itemHelper}
                                    item={item}
                                    selectionProps={props.selectionProps}
                                    itemIndex={index}
                                    getPosition={getPosition}
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
