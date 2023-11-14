import { useMenuPlacement } from "../hooks/useMenuPlacement";
import classNames from "classnames";
import { UseComboboxPropGetters } from "downshift/typings";
import { PropsWithChildren, ReactElement, createElement, useRef } from "react";
import { NoOptionsPlaceholder } from "./Placeholder";

interface ComboboxMenuWrapperProps extends PropsWithChildren, Partial<UseComboboxPropGetters<string>> {
    isOpen: boolean;
    isEmpty: boolean;
    noOptionsText?: string;
}

export function ComboboxMenuWrapper(props: ComboboxMenuWrapperProps): ReactElement {
    const { children, isOpen, isEmpty, noOptionsText, getMenuProps } = props;
    const componentRef = useRef<HTMLDivElement>(null);
    const position = useMenuPlacement(componentRef.current);

    return (
        <div
            ref={componentRef}
            className={classNames("widget-combobox-menu", { "widget-combobox-menu-hidden": !isOpen || !position })}
            style={
                componentRef.current?.parentElement?.clientWidth
                    ? {
                          position: "fixed",
                          width: componentRef.current?.parentElement?.clientWidth,
                          top: position?.bottom,
                          left: position?.left
                      }
                    : {}
            }
        >
            <ul className="widget-combobox-menu-list" {...getMenuProps?.({}, { suppressRefError: true })}>
                {isOpen ? isEmpty ? <NoOptionsPlaceholder>{noOptionsText}</NoOptionsPlaceholder> : children : null}
            </ul>
        </div>
    );
}
