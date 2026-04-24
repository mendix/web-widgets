import classNames from "classnames";
import { ActionValue } from "mendix";
import { ReactElement, useCallback, useEffect, useState, useRef } from "react";
import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import { Menu } from "./Menu";
import { PopupContext } from "./PopupContext";
import { PopupTrigger } from "./PopupTrigger";
import { PopupMenuContainerProps } from "../../typings/PopupMenuProps";
import { usePopup } from "../hooks/usePopup";

export function PopupMenu(props: PopupMenuContainerProps): ReactElement {
    const [visibility, setVisibility] = useState(props.menuToggle);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const listRef = useRef<Array<HTMLElement | null>>([]);
    const open = visibility;
    const popup = usePopup({
        open,
        onOpenChange: setVisibility,
        placement: props.position,
        trigger: props.trigger,
        clippingStrategy: props.clippingStrategy,
        listRef,
        activeIndex,
        onNavigate: setActiveIndex
    });

    const handleOnClickItem = useCallback((itemAction?: ActionValue): void => {
        setVisibility(false);
        setActiveIndex(null);
        executeAction(itemAction);
    }, []);

    useEffect(() => {
        setVisibility(props.menuToggle);
    }, [props.menuToggle]);

    useEffect(() => {
        if (visibility) {
            setActiveIndex(0);
        } else {
            setActiveIndex(null);
        }
    }, [visibility]);

    return (
        <PopupContext.Provider value={popup}>
            <div className={classNames("popupmenu", props.class)}>
                <PopupTrigger>{props.menuTrigger}</PopupTrigger>
                <Menu {...props} onItemClick={handleOnClickItem} listRef={listRef} activeIndex={activeIndex} />
            </div>
        </PopupContext.Provider>
    );
}
