import { GUID, ObjectItem } from "mendix";
import { createElement, ReactElement, ReactNode, useCallback } from "react";
import { useFocusTargetController } from "@mendix/widget-plugin-grid/keyboard-navigation/useFocusTargetController";
import { GalleryPreviewProps } from "../typings/GalleryProps";
import { Gallery as GalleryComponent } from "./components/Gallery";
import { useItemEventsController } from "./features/item-interaction/ItemEventsController";
import { getPosition, useGridPositions } from "./features/useGridPositions";
import { useClickActionHelper } from "./helpers/ClickActionHelper";
import { useItemPreviewHelper } from "./helpers/ItemPreviewHelper";
import { useItemSelectHelper } from "./helpers/useItemSelectHelper";

function Preview(props: GalleryPreviewProps): ReactElement {
    const { emptyPlaceholder } = props;
    const items: ObjectItem[] = Array.from({ length: props.pageSize ?? 5 }).map((_, index) => ({
        id: String(index) as GUID
    }));

    const selectHelper = useItemSelectHelper(props.itemSelection, undefined);

    const { numberOfColumns, numberOfRows } = useGridPositions({
        phoneItems: props.phoneItems ?? 1,
        tabletItems: props.tabletItems ?? 1,
        desktopItems: props.desktopItems ?? 1,
        totalItems: items.length
    });
    const getPositionCallback = useCallback(
        (index: number) => getPosition(numberOfColumns, items.length, index),
        [numberOfColumns, items.length]
    );

    const focusController = useFocusTargetController({
        rows: numberOfRows,
        columns: numberOfColumns,
        pageSize: props.pageSize ?? 0
    });

    const clickActionHelper = useClickActionHelper({ onClick: props.onClick });

    const itemEventsController = useItemEventsController(selectHelper, clickActionHelper, focusController);

    return (
        <GalleryComponent
            className={props.class}
            desktopItems={props.desktopItems!}
            emptyPlaceholderRenderer={useCallback(
                (renderWrapper: (children: ReactNode) => ReactElement) => (
                    <emptyPlaceholder.renderer caption="Empty list message: Place widgets here">
                        {renderWrapper(null)}
                    </emptyPlaceholder.renderer>
                ),
                [emptyPlaceholder]
            )}
            header={
                <props.filtersPlaceholder.renderer caption="Place widgets like filter widget(s) and action button(s) here">
                    <div />
                </props.filtersPlaceholder.renderer>
            }
            showHeader
            hasMoreItems={false}
            items={items}
            itemHelper={useItemPreviewHelper({
                contentValue: props.content,
                hasOnClick: props.onClick !== null
            })}
            numberOfItems={items.length}
            page={0}
            pageSize={props.pageSize ?? 5}
            paging={props.pagination === "buttons"}
            paginationPosition={props.pagingPosition}
            showEmptyStatePreview={props.showEmptyPlaceholder === "custom"}
            phoneItems={props.phoneItems!}
            tabletItems={props.tabletItems!}
            selectHelper={selectHelper}
            itemEventsController={itemEventsController}
            focusController={focusController}
            getPosition={getPositionCallback}
        />
    );
}

export function preview(props: GalleryPreviewProps): ReactElement {
    return createElement(Preview, props);
}
