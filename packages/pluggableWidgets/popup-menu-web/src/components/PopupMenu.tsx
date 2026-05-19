import { FloatingNode, FloatingTree, useFloatingParentNodeId } from "@floating-ui/react";
import classNames from "classnames";
import { ActionValue } from "mendix";
import { ReactElement, useCallback, useEffect, useState } from "react";
import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import { Menu } from "./Menu";
import { PopupContext } from "./PopupContext";
import { PopupTrigger } from "./PopupTrigger";
import { PopupMenuContainerProps } from "../../typings/PopupMenuProps";
import { usePopup } from "../hooks/usePopup";

function PopupMenuComponent(props: PopupMenuContainerProps): ReactElement {
    const [visibility, setVisibility] = useState(props.menuToggle);
    const open = visibility;
    const popup = usePopup({
        open,
        onOpenChange: setVisibility,
        placement: props.position,
        trigger: props.trigger,
        clippingStrategy: props.clippingStrategy,
        hoverCloseOn: props.hoverCloseOn
    });

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
