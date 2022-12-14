import classNames from "classnames";

import { ReactElement, useState, createElement, useCallback, useEffect, useRef, SyntheticEvent } from "react";
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

    return (
        <div ref={triggerRef} className={classNames("popupmenu", props.class)} {...onHover} {...onClick}>
            <div className={"popupmenu-trigger"}>{props.menuTrigger}</div>
            <Menu
                {...props}
                triggerRef={triggerRef}
                visibility={visibility}
                setVisibility={(visibility: boolean) => {
                    setVisibility(visibility);
                }}
            />
        </div>
    );
}
