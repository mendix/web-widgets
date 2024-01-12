import classNames from "classnames";
import { ObjectItem } from "mendix";
import { createElement, memo, ReactElement, useMemo } from "react";
import { useFocusTargetProps } from "@mendix/widget-plugin-grid/keyboard-navigation/useFocusTargetProps";
import { getAriaProps } from "../features/item-interaction/get-item-aria-props";
import { Positions } from "../features/use-grid-positions";
import { ItemSelectHelper } from "../helpers/ItemSelectHelper";
import { GalleryItemHelper } from "../typings/GalleryItem";
import { ItemEventsController } from "../typings/ItemEventsController";

type ListItemProps = Omit<JSX.IntrinsicElements["div"], "ref" | "role"> & {
    getPosition: (index: number) => Positions;
    helper: GalleryItemHelper;
    item: ObjectItem;
    itemIndex: number;
    selectHelper: ItemSelectHelper;
    eventsController: ItemEventsController;
};

const component = memo(function ListItem(props: ListItemProps): ReactElement {
    const { children, className, eventsController, getPosition, helper, item, itemIndex, selectHelper, ...rest } =
        props;
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
                    "widget-gallery-selected": ariaProps["aria-selected"]
                },
                helper.itemClass(item)
            )}
            {...ariaProps}
            onClick={handlers.onClick}
            onDoubleClick={handlers.onDoubleClick}
            onFocus={handlers.onFocus}
            onKeyDown={handlers.onKeyDown}
            onKeyUp={handlers.onKeyUp}
            onMouseDown={handlers.onMouseDown}
            data-position={keyNavProps["data-position"]}
            ref={keyNavProps.ref}
            tabIndex={keyNavProps.tabIndex}
        >
            {helper.render(item)}
        </div>
    );
});

export const ListItem = component as (props: ListItemProps) => ReactElement;
