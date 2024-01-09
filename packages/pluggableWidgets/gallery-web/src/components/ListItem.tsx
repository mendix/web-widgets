import classNames from "classnames";
import { ObjectItem } from "mendix";
import { useMemo, createElement, ReactElement } from "react";
import { GalleryItemHelper } from "../typings/GalleryItem";
import { ItemSelectHelper } from "../helpers/ItemSelectHelper";
import { getAriaProps } from "../features/item-interaction/get-item-aria-props";
import { ItemEventsController } from "../typings/ItemEventsController";

type ListItemProps = Omit<JSX.IntrinsicElements["div"], "ref" | "role"> & {
    helper: GalleryItemHelper;
    item: ObjectItem;
    selectHelper: ItemSelectHelper;
    eventsController: ItemEventsController;
};

export function ListItem({
    children,
    className,
    helper,
    item,
    selectHelper,
    eventsController,
    ...rest
}: ListItemProps): ReactElement {
    const clickable = helper.hasOnClick(item) || selectHelper.selectionType !== "None";
    const ariaProps = getAriaProps(item, selectHelper);
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
        >
            {helper.render(item)}
        </div>
    );
}
