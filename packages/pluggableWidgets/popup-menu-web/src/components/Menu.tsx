import { FloatingFocusManager, useFloatingTree, useMergeRefs } from "@floating-ui/react";
import { ActionValue } from "mendix";
import { forwardRef, KeyboardEvent, ReactElement, RefObject, useCallback } from "react";
import { Activate, MenuItem } from "./MenuItem";
import { BasicItemsType, CustomItemsType, PopupMenuContainerProps } from "../../typings/PopupMenuProps";
import { usePopupContext } from "../hooks/usePopupContext";
import { stopEscapeKeyUp } from "../utils/stopEscapeKeyUp";

export interface MenuProps extends PopupMenuContainerProps {
    onItemClick: (itemAction?: ActionValue) => void;
}

export const Menu = forwardRef((props: MenuProps, propRef: RefObject<HTMLDivElement>): ReactElement | null => {
    const {
        context: floatingContext,
        floatingStyles,
        getFloatingProps,
        refs,
        isNested,
        setOpen,
        returnFocusRef
    } = usePopupContext();
    const tree = useFloatingTree();
    const ref = useMergeRefs([refs.setFloating, propRef]);
    const { clickCloseOn, onItemClick } = props;

    const activate = useCallback<Activate>(
        (itemAction, keyboard) => {
            if (keyboard && isNested && clickCloseOn === "onClickAnywhere") {
                tree?.events.emit("close-all");
            }
            onItemClick(itemAction);
        },
        [clickCloseOn, isNested, onItemClick, tree]
    );

    if (!floatingContext.open) {
        return null;
    }

    const onKeyDown = (e: KeyboardEvent<HTMLUListElement>): void => {
        if (e.key === "Escape" || (e.key === "ArrowLeft" && isNested)) {
            // Close only this level; focus returns to the trigger or the parent item.
            e.preventDefault();
            e.stopPropagation();
            if (e.key === "Escape") {
                stopEscapeKeyUp();
            }
            setOpen(false);
        }
    };

    return (
        <FloatingFocusManager context={floatingContext} modal={false} initialFocus={-1} returnFocus={returnFocusRef}>
            <div className="widget-popupmenu-root">
                <ul
                    ref={ref}
                    style={{ ...floatingStyles, ...props.style }}
                    {...getFloatingProps?.({ className: "popupmenu-menu", onKeyDown })}
                    data-overlay-content
                >
                    {createMenuOptions(props, activate)}
                </ul>
            </div>
        </FloatingFocusManager>
    );
});

function checkVisibility(item: BasicItemsType | CustomItemsType): boolean {
    // Without a visibility expression the item is always shown; while it loads, it stays hidden.
    return item.visible === undefined || item.visible.value === true;
}

/** Whether the menu renders at least one item (dividers aren't items). */
export function hasMenuItems(props: PopupMenuContainerProps): boolean {
    if (!props.advancedMode) {
        return props.basicItems.some(item => checkVisibility(item) && item.itemType !== "divider");
    }
    return props.customItems.some(item => checkVisibility(item));
}

function createMenuOptions(props: PopupMenuContainerProps, activate: Activate): ReactElement[] {
    if (!props.advancedMode) {
        // Only items are numbered for list navigation; dividers are just decoration.
        let itemIndex = 0;
        return props.basicItems
            .filter(item => checkVisibility(item))
            .map((item, key) => {
                if (item.itemType === "divider") {
                    return <li key={key} className={"popupmenu-basic-divider"} role="separator" />;
                }
                return <MenuItem key={key} index={itemIndex++} item={item} activate={activate} />;
            });
    } else {
        return props.customItems
            .filter(item => checkVisibility(item))
            .map((item, index) => <MenuItem key={index} index={index} item={item} activate={activate} />);
    }
}
