import { useFocusTargetProps } from "@mendix/widget-plugin-grid/keyboard-navigation/useFocusTargetProps";
import { PositionInGrid } from "@mendix/widget-plugin-grid/selection";
import classNames from "classnames";
import { ObjectItem } from "mendix";
import { JSX, ReactElement, RefObject, useMemo } from "react";
import { getAriaProps } from "../features/item-interaction/get-item-aria-props";

import { useGalleryItemVM, useSelectActions } from "../model/hooks/injection-hooks";

import { ItemEventsController } from "../typings/ItemEventsController";
import { ListItemButton } from "./ListItemButton";

type ListItemProps = Omit<JSX.IntrinsicElements["div"], "ref" | "role"> & {
    eventsController: ItemEventsController;
    getPosition: (index: number) => PositionInGrid;
    item: ObjectItem;
    itemIndex: number;

    preview?: boolean;
};

export function ListItem(props: ListItemProps): ReactElement {
    const { eventsController, getPosition, item, itemIndex, ...rest } = props;
    const selectActions = useSelectActions();
    const itemVM = useGalleryItemVM();

    const clickable = itemVM.hasOnClick(item) || selectActions.selectionType !== "None";
    const ariaProps = getAriaProps(item, selectActions, itemVM.label(item));
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
                itemVM.class(item)
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
            {itemVM.hasOnClick(item) === true ? (
                <ListItemButton>{itemVM.content(item)}</ListItemButton>
            ) : (
                itemVM.content(item)
            )}
        </div>
    );
}
