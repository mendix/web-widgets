import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import classNames from "classnames";
import { ActionValue } from "mendix";
import { createElement, ReactElement, SyntheticEvent, useCallback, useEffect, useRef, useState } from "react";
import { PopupMenuContainerProps } from "../../typings/PopupMenuProps";
import { Menu } from "./Menu";

export interface PopupMenuProps extends PopupMenuContainerProps {
    preview?: boolean;
}
export function PopupMenu(props: PopupMenuProps): ReactElement {
    const { preview: isPreview, class: className, menuToggle, menuTrigger, trigger, hoverCloseOn } = props;
    const preview = !!isPreview;
    const [visibility, setVisibility] = useState(preview && menuToggle);
    const triggerRef = useRef<HTMLDivElement>(null);

    const handleOnClickTrigger = useCallback(
        (e: SyntheticEvent<HTMLElement>): void => {
            e.preventDefault();
            e.stopPropagation();
            setVisibility(prev => !prev);
        },
        [setVisibility]
    );

    const handleOnHoverEnter = useCallback(
        (e: SyntheticEvent<HTMLElement>): void => {
            e.preventDefault();
            e.stopPropagation();
            console.log(e);

            setVisibility(true);
        },
        [setVisibility]
    );
    const handleOnHoverLeave = useCallback(
        (e: SyntheticEvent<HTMLElement>): void => {
            e.preventDefault();
            e.stopPropagation();
            setVisibility(false);
        },
        [setVisibility]
    );

    const handleOnClickItem = useCallback((itemAction?: ActionValue): void => {
        setVisibility(false);
        executeAction(itemAction);
    }, []);

    const handleCloseRequest = useCallback(() => {
        setVisibility(false);
    }, []);

    let eventHandlers = {};

    if (!preview) {
        if (trigger === "onhover") {
            if (hoverCloseOn === "onHoverOutside") {
                eventHandlers = {
                    onPointerEnter: handleOnHoverEnter,
                    onPointerLeave: handleOnHoverLeave
                };
            } else {
                eventHandlers = {
                    onPointerEnter: handleOnHoverEnter
                };
            }
        } else if (trigger === "onclick" && !preview) {
            eventHandlers = {
                onClick: handleOnClickTrigger
            };
        }
    }

    useEffect(() => {
        setVisibility(menuToggle);
    }, [menuToggle]);
    const open = visibility && triggerRef.current;
    return (
        <div ref={triggerRef} className={classNames("popupmenu", className)} {...eventHandlers}>
            <div className={"popupmenu-trigger"}>{menuTrigger}</div>
            {open ? (
                <Menu
                    {...props}
                    onItemClick={handleOnClickItem}
                    anchorElement={triggerRef.current}
                    onCloseRequest={handleCloseRequest}
                />
            ) : null}
        </div>
    );
}
