import { enableStaticRendering } from "mobx-react-lite";
enableStaticRendering(true);

import { GUID, ObjectItem } from "mendix";
import { createElement, ReactElement, ReactNode, useCallback } from "react";
import { useFocusTargetController } from "@mendix/widget-plugin-grid/keyboard-navigation/useFocusTargetController";
import { GalleryPreviewProps } from "../typings/GalleryProps";
import { Gallery as GalleryComponent } from "./components/Gallery";
import { useItemEventsController } from "./features/item-interaction/ItemEventsController";
import { useGridPositions } from "./features/useGridPositions";
import { useClickActionHelper } from "@mendix/widget-plugin-grid/helpers/ClickActionHelper";
import { useItemPreviewHelper } from "./helpers/ItemPreviewHelper";
import { useItemSelectHelper } from "./helpers/useItemSelectHelper";
import { getColumnAndRowBasedOnIndex } from "@mendix/widget-plugin-grid/selection";
import "./ui/GalleryPreview.scss";

const numberOfItems = 3;

function Preview(props: GalleryPreviewProps): ReactElement {
    const { emptyPlaceholder } = props;
    const items: ObjectItem[] = Array.from({ length: numberOfItems }).map((_, index) => ({
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
        (index: number) => getColumnAndRowBasedOnIndex(numberOfColumns, items.length, index),
        [numberOfColumns, items.length]
    );

    const focusController = useFocusTargetController({
        rows: numberOfRows,
        columns: numberOfColumns,
        pageSize: props.pageSize ?? 0
    });

    const clickActionHelper = useClickActionHelper({ onClick: props.onClick, onClickTrigger: "none" });

    const itemEventsController = useItemEventsController(
        selectHelper,
        clickActionHelper,
        focusController,
        numberOfColumns,
        props.itemSelectionMode
    );

    return (
        <GalleryComponent
            className={props.class}
            desktopItems={props.content.widgetCount > 0 ? numberOfItems : props.desktopItems!}
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
            numberOfItems={props.pageSize ?? numberOfItems}
            page={0}
            pageSize={props.pageSize ?? numberOfItems}
            paging={props.pagination === "buttons"}
            paginationPosition={props.pagingPosition}
            showEmptyStatePreview={props.showEmptyPlaceholder === "custom"}
            phoneItems={props.phoneItems!}
            tabletItems={props.tabletItems!}
            selectHelper={selectHelper}
            itemEventsController={itemEventsController}
            focusController={focusController}
            getPosition={getPositionCallback}
            preview
        />
    );
}

export function preview(props: GalleryPreviewProps): ReactElement {
    return createElement(Preview, props);
}
