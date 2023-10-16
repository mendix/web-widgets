import classNames from "classnames";
import { UseComboboxGetToggleButtonPropsOptions } from "downshift/typings";
import { PropsWithChildren, ReactElement, RefObject, createElement, forwardRef } from "react";
import { DownArrow } from "../assets/icons";

interface ComboboxWrapperProps extends PropsWithChildren {
    isOpen: boolean;
    readOnly: boolean;
    getToggleButtonProps: (options?: UseComboboxGetToggleButtonPropsOptions | undefined) => any;
}

export const ComboboxWrapper = forwardRef(
    (props: ComboboxWrapperProps, ref: RefObject<HTMLDivElement>): ReactElement => {
        const { isOpen, readOnly, getToggleButtonProps, children } = props;
        return (
            <div
                ref={ref}
                tabIndex={-1}
                className={classNames("form-control", "widget-combobox-input-container", {
                    "widget-combobox-input-container-active": isOpen,
                    "widget-combobox-input-container-disabled": readOnly
                })}
                {...getToggleButtonProps()}
            >
                {children}
                <div className="widget-combobox-down-arrow">
                    <DownArrow isOpen={isOpen} />
                </div>
            </div>
        );
    }
);
