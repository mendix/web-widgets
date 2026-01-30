import { useFocusTargetProps } from "@mendix/widget-plugin-grid/keyboard-navigation/useFocusTargetProps";
import classNames from "classnames";
import { ObjectItem } from "mendix";
import { computed, trace } from "mobx";
import { observer } from "mobx-react-lite";
import { ReactElement, RefObject, useMemo } from "react";
import { getAriaProps } from "../features/item-interaction/get-item-aria-props";
import { useGalleryItemVM, useItemEventsVM, useLayoutService, useSelectActions } from "../model/hooks/injection-hooks";
import { ListItemButton } from "./ListItemButton";

type ListItemProps = {
    item: ObjectItem;
    itemIndex: number;
};

export const ListItem = observer(function ListItem(props: ListItemProps): ReactElement {
    const { item, itemIndex, ...rest } = props;

    const eventsVM = useItemEventsVM().get();
    const selectActions = useSelectActions();
    const itemVM = useGalleryItemVM();
    const getPosition = useLayoutService().getPositionFn;

    const isSelected = computed(
        () => {
            trace();
            return selectActions.isSelected(item);
        },
        { name: "[gallery]:@computed:ListItem:isSelected" }
    ).get();
    const clickable = itemVM.hasOnClick(item) || selectActions.selectionType !== "None";
    const ariaProps = getAriaProps(selectActions.selectionType, isSelected, itemVM.label(item));
    const { columnIndex, rowIndex } = getPosition(itemIndex);
    const keyNavProps = useFocusTargetProps({ columnIndex: columnIndex ?? -1, rowIndex });
    const handlers = useMemo(() => eventsVM.getProps(item), [eventsVM, item]);

    return (
        <div
            {...rest}
            className={classNames(
                "widget-gallery-item",
                {
                    "widget-gallery-clickable": clickable,
                    "widget-gallery-selected": ariaProps["aria-selected"]
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
});
