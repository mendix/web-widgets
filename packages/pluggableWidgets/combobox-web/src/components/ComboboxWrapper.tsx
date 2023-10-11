import classNames from "classnames";
import { UseComboboxGetToggleButtonPropsOptions } from "downshift/typings";
import { MouseEventHandler, PropsWithChildren, ReactElement, RefObject, createElement, forwardRef } from "react";
import { DownArrow } from "../assets/icons";

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
                <div className="widget-combobox-down-arrow" {...getToggleButtonProps({ "aria-expanded": undefined })}>
                    <DownArrow isOpen={isOpen} />
                </div>
            </div>
        );
    }
);
