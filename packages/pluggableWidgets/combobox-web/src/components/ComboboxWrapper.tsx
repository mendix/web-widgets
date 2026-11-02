import classNames from "classnames";
import { forwardRef, Fragment, MouseEvent, PropsWithChildren, ReactElement, Ref } from "react";
import { ReadOnlyStyleEnum } from "typings/ComboboxProps";
import { ValidationAlert } from "@mendix/widget-plugin-component-kit/Alert";
import { classes } from "./classes";
import { legacy } from "./legacyModifiers";
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
    /** Multi mode: something is selected, so the closed input collapses next to the chips or the text. */
    hasSelection?: boolean;
    errorId?: string;
}
export const ComboboxWrapper = forwardRef((props: ComboboxWrapperProps, ref: Ref<HTMLDivElement>): ReactElement => {
    const { isOpen, readOnly, readOnlyStyle, toggleProps, validation, children, isLoading, hasSelection, errorId } =
        props;
    const { id, onClick } = toggleProps;
    const textOnly = readOnly && readOnlyStyle === "text";

    return (
        <Fragment>
            <div
                ref={ref}
                tabIndex={-1}
                className={classNames(classes.inputContainer, {
                    [legacy.containerOpen]: isOpen,
                    [legacy.containerDisabled]: readOnly,
                    "form-control-static": textOnly,
                    "form-control": !textOnly,
                    [legacy.containerHasSelection]: hasSelection
                })}
                id={id}
                onClick={onClick}
                data-open={isOpen || undefined}
                data-disabled={readOnly || undefined}
                data-has-selection={hasSelection || undefined}
            >
                {children}
                {textOnly ? null : (
                    <div className={classes.toggle} data-open={isOpen || undefined}>
                        {isLoading ? <SpinnerLoader size="small" /> : <DownArrow isOpen={isOpen} />}
                    </div>
                )}
            </div>
            {validation && <ValidationAlert id={errorId}>{validation}</ValidationAlert>}
        </Fragment>
    );
});
