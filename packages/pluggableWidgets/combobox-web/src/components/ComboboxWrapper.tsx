import classNames from "classnames";
import { UseComboboxGetToggleButtonPropsOptions } from "downshift/typings";
import { forwardRef, Fragment, PropsWithChildren, ReactElement, Ref } from "react";
import { ReadOnlyStyleEnum } from "typings/ComboboxProps";
import { ValidationAlert } from "@mendix/widget-plugin-component-kit/Alert";
import { SpinnerLoader } from "./SpinnerLoader";
import { DownArrow } from "../assets/icons";

interface ComboboxWrapperProps extends PropsWithChildren {
    isOpen: boolean;
    readOnly: boolean;
    readOnlyStyle: ReadOnlyStyleEnum;
    getToggleButtonProps: (options?: UseComboboxGetToggleButtonPropsOptions | undefined) => any;
    validation?: string;
    isLoading: boolean;
    isMultiselectActive?: boolean;
    errorId?: string;
}
export const ComboboxWrapper = forwardRef((props: ComboboxWrapperProps, ref: Ref<HTMLDivElement>): ReactElement => {
    const {
        isOpen,
        readOnly,
        readOnlyStyle,
        getToggleButtonProps,
        validation,
        children,
        isLoading,
        isMultiselectActive,
        errorId
    } = props;
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
                    "form-control": !readOnly || readOnlyStyle !== "text",
                    "widget-combobox-multiselect": isMultiselectActive
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
            {validation && <ValidationAlert id={errorId}>{validation}</ValidationAlert>}
        </Fragment>
    );
});
