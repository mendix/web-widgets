import classNames from "classnames";
import { UseComboboxGetToggleButtonPropsOptions } from "downshift/typings";
import { PropsWithChildren, ReactElement, RefObject, createElement, forwardRef, Fragment } from "react";
import { DownArrow } from "../assets/icons";
import { ValidationAlert } from "@mendix/widget-plugin-component-kit/Alert";

interface ComboboxWrapperProps extends PropsWithChildren {
    isOpen: boolean;
    readOnly: boolean;
    getToggleButtonProps: (options?: UseComboboxGetToggleButtonPropsOptions | undefined) => any;
    validation?: string;
}

export const ComboboxWrapper = forwardRef(
    (props: ComboboxWrapperProps, ref: RefObject<HTMLDivElement>): ReactElement => {
        const { isOpen, readOnly, getToggleButtonProps, validation, children } = props;
        const { id, onClick } = getToggleButtonProps();

        return (
            <Fragment>
                <div
                    ref={ref}
                    tabIndex={-1}
                    className={classNames("form-control", "widget-combobox-input-container", {
                        "widget-combobox-input-container-active": isOpen,
                        "widget-combobox-input-container-disabled": readOnly
                    })}
                    id={id}
                    onClick={onClick}
                >
                    {children}
                    <div className="widget-combobox-down-arrow">
                        <DownArrow isOpen={isOpen} />
                    </div>
                </div>
                {validation && <ValidationAlert>{validation}</ValidationAlert>}
            </Fragment>
        );
    }
);
