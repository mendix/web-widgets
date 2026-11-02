import classNames from "classnames";
import { forwardRef, Fragment, MouseEvent, PropsWithChildren, ReactElement, Ref } from "react";
import { ReadOnlyStyleEnum } from "typings/ComboboxProps";
import { ValidationAlert } from "@mendix/widget-plugin-component-kit/Alert";
import { SpinnerLoader } from "./SpinnerLoader";
import { DownArrow } from "../assets/icons";

interface ComboboxWrapperProps extends PropsWithChildren {
    isOpen: boolean;
    readOnly: boolean;
    readOnlyStyle: ReadOnlyStyleEnum;
    /** From the Behavior: only the id and the click handler go on the container. */
    toggleProps: { id?: string; onClick?(e: MouseEvent): void };
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
        toggleProps,
        validation,
        children,
        isLoading,
        isMultiselectActive,
        errorId
    } = props;
    const { id, onClick } = toggleProps;

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
