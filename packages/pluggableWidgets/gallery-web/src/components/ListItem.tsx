import classNames from "classnames";
import { ObjectItem } from "mendix";
import { createElement, ReactElement, useMemo, RefObject } from "react";
import { useFocusTargetProps } from "@mendix/widget-plugin-grid/keyboard-navigation/useFocusTargetProps";
import { PositionInGrid, SelectActionHandler } from "@mendix/widget-plugin-grid/selection";
import { getAriaProps } from "../features/item-interaction/get-item-aria-props";

import { GalleryItemHelper } from "../typings/GalleryItem";
import { ItemEventsController } from "../typings/ItemEventsController";

type ListItemProps = Omit<JSX.IntrinsicElements["div"], "ref" | "role"> & {
    eventsController: ItemEventsController;
    getPosition: (index: number) => PositionInGrid;
    helper: GalleryItemHelper;
    item: ObjectItem;
    itemIndex: number;
    selectHelper: SelectActionHandler;
    preview?: boolean;
};

export function ListItem(props: ListItemProps): ReactElement {
    const { eventsController, getPosition, helper, item, itemIndex, selectHelper, ...rest } = props;
    const clickable = helper.hasOnClick(item) || selectHelper.selectionType !== "None";
    const ariaProps = getAriaProps(item, selectHelper);
    const { columnIndex, rowIndex } = getPosition(itemIndex);
    const keyNavProps = useFocusTargetProps({ columnIndex: columnIndex ?? -1, rowIndex });
    const handlers = useMemo(() => eventsController.getProps(item), [eventsController, item]);

    return (
        <div
            {...rest}
            className={classNames(
                "widget-gallery-item",
                {
                    "widget-gallery-clickable": clickable,
                    "widget-gallery-selected": ariaProps["aria-selected"],
                    "widget-gallery-preview": props.preview
                },
                helper.itemClass(item)
            )}
            {...ariaProps}
            onClick={handlers.onClick}
            onFocus={handlers.onFocus}
            onKeyDown={handlers.onKeyDown}
            onKeyUp={handlers.onKeyUp}
            onMouseDown={handlers.onMouseDown}
            data-position={keyNavProps["data-position"]}
            ref={keyNavProps.ref as RefObject<HTMLDivElement>}
            tabIndex={keyNavProps.tabIndex}
        >
            {helper.render(item)}
        </div>
    );
}
