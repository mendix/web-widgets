import { FloatingNode, FloatingTree, useFloatingParentNodeId, useFloatingTree } from "@floating-ui/react";
import classNames from "classnames";
import { ActionValue } from "mendix";
import { ReactElement, useCallback, useContext, useEffect, useLayoutEffect, useState } from "react";
import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import { hasMenuItems, Menu } from "./Menu";
import { MenuItemContext, PopupContext } from "./PopupContext";
import { PopupTrigger } from "./PopupTrigger";
import { PopupMenuContainerProps } from "../../typings/PopupMenuProps";
import { usePopup } from "../hooks/usePopup";

interface SubmenuOpenEvent {
    parentId: string | null;
    nodeId: string;
}

function PopupMenuComponent(props: PopupMenuContainerProps): ReactElement {
    const [visibility, setVisibility] = useState(props.menuToggle);
    const open = visibility;
    const hasItems = hasMenuItems(props);
    const popup = usePopup({
        open,
        onOpenChange: setVisibility,
        placement: props.position,
        trigger: props.trigger,
        clippingStrategy: props.clippingStrategy,
        hoverCloseOn: props.hoverCloseOn,
        hasItems
    });
    const { nodeId, setActiveIndex, returnFocusRef, refs } = popup;
    const parentId = useFloatingParentNodeId();
    const tree = useFloatingTree();
    const menuItem = useContext(MenuItemContext);
    const parentItem = parentId != null ? menuItem : null;

    const handleOnClickItem = useCallback(
        (itemAction?: ActionValue): void => {
            if (props.clickCloseOn === "onClickAnywhere") setVisibility(false);
            executeAction(itemAction);
        },
        [props.clickCloseOn]
    );

    useEffect(() => {
        setVisibility(props.menuToggle);
    }, [props.menuToggle]);

    // Link a nested menu to the parent menu item, so the item can open it from the keyboard.
    useEffect(() => {
        if (!parentItem) {
            return;
        }
        return parentItem.registerSubmenu(nodeId, {
            open: () => {
                // List navigation focuses the active item once the menu is rendered.
                setActiveIndex(hasItems ? 0 : null);
                setVisibility(true);
            },
            contains: node => !!refs.floating.current?.contains(node),
            isOpen: open
        });
    }, [parentItem, nodeId, open, hasItems, setActiveIndex, refs]);

    // A nested menu returns focus to its parent item.
    useLayoutEffect(() => {
        if (open && parentItem) {
            returnFocusRef.current = parentItem.itemRef.current;
        }
    }, [open, parentItem, returnFocusRef]);

    useEffect(() => {
        if (!tree) {
            return;
        }
        const closeAll = (): void => setVisibility(false);
        const closeSibling = (event: SubmenuOpenEvent): void => {
            if (event.parentId === parentId && event.nodeId !== nodeId) {
                setVisibility(false);
            }
        };
        tree.events.on("close-all", closeAll);
        tree.events.on("submenu-open", closeSibling);
        return () => {
            tree.events.off("close-all", closeAll);
            tree.events.off("submenu-open", closeSibling);
        };
    }, [tree, parentId, nodeId]);

    useEffect(() => {
        if (open && tree && parentId != null) {
            tree.events.emit("submenu-open", { parentId, nodeId } satisfies SubmenuOpenEvent);
        }
    }, [open, tree, parentId, nodeId]);

    return (
        <PopupContext.Provider value={popup}>
            <FloatingNode id={popup.nodeId}>
                <div className={classNames("popupmenu", props.class)}>
                    <PopupTrigger>{props.menuTrigger}</PopupTrigger>
                    <Menu {...props} onItemClick={handleOnClickItem} />
                </div>
            </FloatingNode>
        </PopupContext.Provider>
    );
}

export function PopupMenu(props: PopupMenuContainerProps): ReactElement {
    const parentId = useFloatingParentNodeId();

    // If this is a root popup (no parent), wrap it in FloatingTree
    if (parentId == null) {
        return (
            <FloatingTree>
                <PopupMenuComponent {...props} />
            </FloatingTree>
        );
    }

    // If this is a nested popup, just render the component
    return <PopupMenuComponent {...props} />;
}
