import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import classNames from "classnames";
import { ActionValue } from "mendix";
import { createElement, ReactElement, useCallback, useEffect, useState } from "react";
import { PopupMenuContainerProps } from "../../typings/PopupMenuProps";
import { usePopup } from "../hooks/usePopup";
import { Menu } from "./Menu";
import { PopupContext } from "./PopupContext";
import { PopupTrigger } from "./PopupTrigger";

export interface PopupMenuProps extends PopupMenuContainerProps {
    preview?: boolean;
}

export function PopupMenu(props: PopupMenuProps): ReactElement {
    const preview = !!props.preview;
    const [visibility, setVisibility] = useState(preview && props.menuToggle);
    const open = visibility;
    const popup = usePopup({
        open,
        onOpenChange: setVisibility,
        placement: props.position,
        trigger: props.trigger,
        clippingStrategy: props.clippingStrategy
    });

    const handleOnClickItem = useCallback((itemAction?: ActionValue): void => {
        setVisibility(false);
        executeAction(itemAction);
    }, []);

    useEffect(() => {
        setVisibility(props.menuToggle);
    }, [props.menuToggle]);

    return (
        <PopupContext.Provider value={popup}>
            <div className={classNames("popupmenu", props.class)}>
                <PopupTrigger>{props.menuTrigger}</PopupTrigger>
                <Menu {...props} onItemClick={handleOnClickItem} />
            </div>
        </PopupContext.Provider>
    );
}
