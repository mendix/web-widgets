import { usePositionObserver } from "@mendix/pluggable-widgets-commons/components/web";
import classNames from "classnames";
import { UseComboboxGetToggleButtonPropsOptions, UseComboboxPropGetters } from "downshift/typings";
import {
    MouseEventHandler,
    PropsWithChildren,
    ReactElement,
    RefObject,
    createElement,
    forwardRef,
    useRef
} from "react";
import { DownArrow } from "../assets/icons";
import { EmptyItemPlaceholder } from "./Placeholder";

interface ComboboxWrapperProps extends PropsWithChildren {
    isOpen: boolean;
    readOnly: boolean;
    onClick?: MouseEventHandler<HTMLDivElement>;
    getToggleButtonProps: (options?: UseComboboxGetToggleButtonPropsOptions | undefined) => any;
}

export const ComboboxWrapper = forwardRef(
    (props: ComboboxWrapperProps, ref: RefObject<HTMLDivElement>): ReactElement => {
        const { isOpen, readOnly, getToggleButtonProps, children, onClick } = props;
        return (
            <div
                ref={ref}
                tabIndex={-1}
                className={classNames("form-control", "widget-combobox-input-container", {
                    "widget-combobox-input-container-active": isOpen,
                    "widget-combobox-input-container-disabled": readOnly
                })}
                onClick={onClick}
            >
                {children}
                <div className="widget-combobox-down-arrow" {...getToggleButtonProps()}>
                    <DownArrow isOpen={isOpen} />
                </div>
            </div>
        );
    }
);

interface ComboboxMenuWrapperProps extends PropsWithChildren, Partial<UseComboboxPropGetters<any>> {
    isOpen: boolean;
    isEmpty: boolean;
    placeholderText?: string | null;
}

export function ComboboxMenuWrapper(props: ComboboxMenuWrapperProps): ReactElement {
    const { children, isOpen, isEmpty, placeholderText, getMenuProps } = props;
    const componentRef = useRef<HTMLDivElement>(null);
    const position = usePositionObserver(componentRef.current?.parentElement || null, isOpen);
    return (
        <div
            ref={componentRef}
            className={classNames("widget-combobox-menu", { "widget-combobox-menu-hidden": !isOpen })}
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
                {isOpen ? isEmpty ? <EmptyItemPlaceholder>{placeholderText}</EmptyItemPlaceholder> : children : null}
            </ul>
        </div>
    );
}
