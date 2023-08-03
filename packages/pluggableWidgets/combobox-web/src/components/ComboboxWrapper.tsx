import classNames from "classnames";
import { createElement, forwardRef, RefObject, PropsWithChildren, ReactElement } from "react";
import { DownArrow } from "../assets/icons";

interface ComboboxWrapperProps extends PropsWithChildren {
    isOpen: boolean;
    readOnly: boolean;
    toggleMenu: () => void;
}

export const ComboboxWrapper = forwardRef(
    (props: ComboboxWrapperProps, ref: RefObject<HTMLDivElement>): ReactElement => {
        const { isOpen, readOnly, toggleMenu, children } = props;

        return (
            <div
                ref={ref}
                tabIndex={-1}
                className={classNames("form-control", "widget-combobox-input-container", {
                    "widget-combobox-input-container-active": isOpen,
                    "widget-combobox-input-container-disabled": readOnly
                })}
            >
                {children}
                <div className="widget-combobox-down-arrow" onClick={toggleMenu}>
                    <DownArrow />
                </div>
            </div>
        );
    }
);
