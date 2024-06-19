import classNames from "classnames";
import { UseComboboxGetToggleButtonPropsOptions } from "downshift/typings";
import { PropsWithChildren, ReactElement, RefObject, createElement, forwardRef, Fragment } from "react";
import { DownArrow } from "../assets/icons";
import { ValidationAlert } from "@mendix/widget-plugin-component-kit/Alert";
import { ReadOnlyStyleEnum } from "typings/ComboboxProps";
import { SpinnerLoader } from "./SpinnerLoader";

interface ComboboxWrapperProps extends PropsWithChildren {
    isOpen: boolean;
    readOnly: boolean;
    readOnlyStyle: ReadOnlyStyleEnum;
    getToggleButtonProps: (options?: UseComboboxGetToggleButtonPropsOptions | undefined) => any;
    validation?: string;
    isLoading: boolean;
}

export const ComboboxWrapper = forwardRef(
    (props: ComboboxWrapperProps, ref: RefObject<HTMLDivElement>): ReactElement => {
        const { isOpen, readOnly, readOnlyStyle, getToggleButtonProps, validation, children, isLoading } = props;
        const { id, onClick } = getToggleButtonProps();

        return (
            <Fragment>
                <div
                    ref={ref}
                    tabIndex={-1}
                    className={classNames("widget-combobox-input-container", {
                        "widget-combobox-input-container-active": isOpen,
                        "widget-combobox-input-container-disabled": readOnly,
                        "form-control-static": readOnly && readOnlyStyle === "text",
                        "form-control": !readOnly || readOnlyStyle !== "text"
                    })}
                    id={id}
                    onClick={onClick}
                >
                    {children}
                    {readOnly && readOnlyStyle === "text" ? null : isLoading ? (
                        <div className="widget-combobox-down-arrow">
                            <SpinnerLoader size="small" />
                        </div>
                    ) : (
                        <div className="widget-combobox-down-arrow">
                            <DownArrow isOpen={isOpen} />
                        </div>
                    )}
                </div>
                {validation && <ValidationAlert>{validation}</ValidationAlert>}
            </Fragment>
        );
    }
);
