import { createElement, ReactElement, useCallback } from "react";
import { GalleryPreviewProps } from "../typings/GalleryProps";
import { Gallery as GalleryComponent } from "./components/Gallery";
import { ObjectItem, GUID } from "mendix";

function Preview(props: GalleryPreviewProps): ReactElement {
    const items: ObjectItem[] = Array.from({ length: props.pageSize ?? 5 }).map((_, index) => ({
        id: String(index) as GUID
    }));

    const showHeader = props.filterList.length > 0 || props.sortList.length > 0 || props.itemSelection === "Multi";
    return (
        <GalleryComponent
            className={props.class}
            desktopItems={props.desktopItems!}
            emptyPlaceholderRenderer={useCallback(
                renderWrapper => (
                    <props.emptyPlaceholder.renderer caption="Empty list message: Place widgets here">
                        {renderWrapper(null)}
                    </props.emptyPlaceholder.renderer>
                ),
                [props.emptyPlaceholder]
            )}
            header={
                showHeader ? (
                    <props.filtersPlaceholder.renderer caption="Gallery header: Place widgets here">
                        <div />
                    </props.filtersPlaceholder.renderer>
                ) : null
            }
            showHeader={!!props.filterList.length}
            hasMoreItems={false}
            items={items}
            itemRenderer={useCallback(
                renderWrapper => (
                    <props.content.renderer caption="Gallery item: Place widgets here">
                        {renderWrapper(false, null, "")}
                    </props.content.renderer>
                ),
                [props.content]
            )}
            numberOfItems={items.length}
            page={0}
            pageSize={props.pageSize ?? 5}
            paging={props.pagination === "buttons"}
            paginationPosition={props.pagingPosition}
            preview
            phoneItems={props.phoneItems!}
            tabletItems={props.tabletItems!}
        />
    );
}

export function preview(props: GalleryPreviewProps): ReactElement {
    return createElement(Preview, props);
}
