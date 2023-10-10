import { GUID, ObjectItem } from "mendix";
import { createElement, ReactElement, ReactNode, useCallback } from "react";
import { GalleryPreviewProps } from "../typings/GalleryProps";
import { Gallery as GalleryComponent } from "./components/Widget";
import { useWidgetPreviewItem } from "./herlpers/WidgetPreviewItem";

function Preview(props: GalleryPreviewProps): ReactElement {
    const items: ObjectItem[] = Array.from({ length: props.pageSize ?? 5 }).map((_, index) => ({
        id: String(index) as GUID
    }));

    return (
        <GalleryComponent
            className={props.class}
            desktopItems={props.desktopItems!}
            emptyPlaceholderRenderer={useCallback(
                (renderWrapper: (children: ReactNode) => ReactElement) => (
                    <props.emptyPlaceholder.renderer caption="Empty list message: Place widgets here">
                        {renderWrapper(null)}
                    </props.emptyPlaceholder.renderer>
                ),
                [props.emptyPlaceholder]
            )}
            header={
                <props.filtersPlaceholder.renderer caption="Place widgets like filter widget(s) and action button(s) here">
                    <div />
                </props.filtersPlaceholder.renderer>
            }
            showHeader
            hasMoreItems={false}
            items={items}
            itemHelper={useWidgetPreviewItem({ contentValue: props.content })}
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
