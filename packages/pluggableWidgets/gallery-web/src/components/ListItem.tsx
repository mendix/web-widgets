import classNames from "classnames";
import { ObjectItem } from "mendix";
import { createElement, memo, ReactElement, useMemo, RefObject } from "react";
import { useFocusTargetProps } from "@mendix/widget-plugin-grid/keyboard-navigation/useFocusTargetProps";
import { PositionInGrid } from "@mendix/widget-plugin-grid/selection";
import { getAriaProps } from "../features/item-interaction/get-item-aria-props";
import { SelectActionHelper } from "../helpers/SelectActionHelper";
import { GalleryItemHelper } from "../typings/GalleryItem";
import { ItemEventsController } from "../typings/ItemEventsController";

type BaseProps = {
    helper: GalleryItemHelper;
    item: ObjectItem;
    selectHelper: SelectActionHelper;
};

type ListItemComponentProps = JSX.IntrinsicElements["div"] & BaseProps;

type ListItemContainerProps = Omit<ListItemComponentProps, "ref" | "role"> &
    BaseProps & {
        eventsController: ItemEventsController;
        getPosition: (index: number) => PositionInGrid;
        itemIndex: number;
    };

// eslint-disable-next-line prefer-arrow-callback
const ListItemComponent = memo(function ListItemComponent(props: ListItemComponentProps): ReactElement {
    const { helper, item, selectHelper, ...rest } = props;
    const ariaProps = getAriaProps(item, selectHelper);
    const clickable = helper.hasOnClick(item) || selectHelper.selectionType !== "None";
    return (
        <div
            className={classNames(
                "widget-gallery-item",
                {
                    "widget-gallery-clickable": clickable,
                    "widget-gallery-selected": ariaProps["aria-selected"]
                },
                helper.itemClass(item)
            )}
            {...rest}
            {...ariaProps}
        >
            {helper.render(item)}
        </div>
    );
});

export function ListItem(props: ListItemContainerProps): ReactElement {
    const { eventsController, getPosition, item, itemIndex, ...rest } = props;
    const { columnIndex, rowIndex } = getPosition(itemIndex);
    const keyNavProps = useFocusTargetProps({ columnIndex: columnIndex ?? -1, rowIndex });
    const handlers = useMemo(() => eventsController.getProps(item), [eventsController, item]);

    return (
        <ListItemComponent
            {...rest}
            item={item}
            onClick={handlers.onClick}
            onFocus={handlers.onFocus}
            onKeyDown={handlers.onKeyDown}
            onKeyUp={handlers.onKeyUp}
            onMouseDown={handlers.onMouseDown}
            data-position={keyNavProps["data-position"]}
            ref={keyNavProps.ref as RefObject<HTMLDivElement>}
            tabIndex={keyNavProps.tabIndex}
        />
    );
}
