import { useFloatingTree, useMergeRefs } from "@floating-ui/react";
import classNames from "classnames";
import { ActionValue } from "mendix";
import { FocusEvent, KeyboardEvent, MouseEvent, ReactElement, useCallback, useMemo, useRef, useState } from "react";
import { MenuItemContext, MenuItemContextType, SubmenuHandle } from "./PopupContext";
import { BasicItemsType, CustomItemsType, StyleClassEnum } from "../../typings/PopupMenuProps";
import { useMouseDownRef } from "../hooks/useMouseDownRef";
import { usePopupContext } from "../hooks/usePopupContext";

export type Activate = (itemAction: ActionValue | undefined, keyboard: boolean) => void;

interface MenuItemProps {
    index: number;
    /** A basic item (not a divider) or a custom item. */
    item: BasicItemsType | CustomItemsType;
    activate: Activate;
}

interface RegisteredSubmenu {
    id: string;
    handle: SubmenuHandle;
}

export function MenuItem({ index, item, activate }: MenuItemProps): ReactElement {
    const { action } = item;
    const isCustom = "content" in item;
    const className = isCustom
        ? "popupmenu-custom-item"
        : classNames("popupmenu-basic-item", getStyleClassName(item.styleClass));
    const { getItemProps, activeIndex, listRef } = usePopupContext();
    const itemRef = useRef<HTMLLIElement>(null);
    const [submenu, setSubmenu] = useState<RegisteredSubmenu | null>(null);
    const tree = useFloatingTree();
    const [mouseDownRef, onMouseDown] = useMouseDownRef();
    const listItemRef = useCallback(
        (node: HTMLLIElement | null) => {
            listRef.current[index] = node;
        },
        [listRef, index]
    );
    const ref = useMergeRefs([itemRef, listItemRef]);

    const menuItemContext = useMemo<MenuItemContextType>(
        () => ({
            itemRef,
            registerSubmenu(id, handle) {
                // Only the first nested Pop-up Menu in an item is linked to it.
                setSubmenu(current => (current && current.id !== id ? current : { id, handle }));
                return () => setSubmenu(current => (current?.id === id ? null : current));
            }
        }),
        []
    );

    // Without an active item (e.g. after hover open), the first item is the tab stop.
    const isTabStop = activeIndex === null ? index === 0 : activeIndex === index;

    const onFocus = (e: FocusEvent<HTMLLIElement>): void => {
        // The submenu is rendered inside this item, so Shift+Tab from it lands here, which
        // closeOnFocusOut doesn't treat as leaving. Tab leaves the whole menu hierarchy.
        if (e.target === e.currentTarget && !mouseDownRef.current && submenu?.handle.contains(e.relatedTarget)) {
            tree?.events.emit("close-all");
        }
    };

    const onKeyDown = (e: KeyboardEvent<HTMLLIElement>): void => {
        // Ignore keys bubbling from the item content, e.g. a nested menu.
        if (e.target !== e.currentTarget) {
            return;
        }
        if (submenu && (e.key === "ArrowRight" || e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            e.stopPropagation();
            submenu.handle.open();
        } else if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            activate(action, true);
        }
    };

    return (
        <MenuItemContext.Provider value={menuItemContext}>
            <li
                {...getItemProps({
                    ref,
                    className,
                    role: "menuitem",
                    tabIndex: isTabStop ? 0 : -1,
                    ...(submenu && {
                        "aria-haspopup": "menu",
                        "aria-expanded": submenu.handle.isOpen
                    }),
                    onClick: (e: MouseEvent<HTMLLIElement>) => {
                        e.preventDefault();
                        e.stopPropagation();
                        activate(action, false);
                    },
                    onKeyDown,
                    onFocus,
                    onMouseDown
                })}
            >
                {isCustom ? item.content : (item.caption?.value ?? "")}
            </li>
        </MenuItemContext.Provider>
    );
}

/** Modifier class for a basic item style, e.g. "primaryStyle" → "popupmenu-basic-item-primary". */
function getStyleClassName(styleClass: StyleClassEnum): string | undefined {
    return styleClass !== "defaultStyle" ? "popupmenu-basic-item-" + styleClass.replace("Style", "") : undefined;
}
