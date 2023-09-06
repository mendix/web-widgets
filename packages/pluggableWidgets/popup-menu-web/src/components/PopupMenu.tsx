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
    const preview = !!props.preview;
    const [visibility, setVisibility] = useState(preview && props.menuToggle);
    const triggerRef = useRef<HTMLDivElement>(null);

    const handleOnClickTrigger = useCallback(
        (e: SyntheticEvent<HTMLElement>): void => {
            e.preventDefault();
            e.stopPropagation();
            setVisibility(prev => !prev);
        },
        [setVisibility]
    );

    const handleOnHoverTrigger = useCallback(
        (e: SyntheticEvent<HTMLElement>): void => {
            e.preventDefault();
            e.stopPropagation();
            setVisibility(true);
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

    const onHover =
        props.trigger === "onhover" && !preview
            ? {
                  onPointerEnter: handleOnHoverTrigger
              }
            : {};
    const onClick =
        props.trigger === "onclick" && !preview
            ? {
                  onClick: handleOnClickTrigger
              }
            : {};

    useEffect(() => {
        setVisibility(props.menuToggle);
    }, [props.menuToggle]);
    const open = visibility && triggerRef.current;
    return (
        <div ref={triggerRef} className={classNames("popupmenu")} {...onHover} {...onClick}>
            <div className={"popupmenu-trigger"}>{props.menuTrigger}</div>
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
