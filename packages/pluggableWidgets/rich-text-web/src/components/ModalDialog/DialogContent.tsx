import { If } from "@mendix/widget-plugin-component-kit/If";
import classNames from "classnames";
import { Fragment, PropsWithChildren, ReactElement } from "react";

interface PropsWithChildrenWithClass extends PropsWithChildren {
    className?: string;
}

export interface DialogContentProps extends PropsWithChildrenWithClass {
    formOrientation: "horizontal" | "vertical";
}

export function DialogContent(props: DialogContentProps): ReactElement {
    const { children, className, formOrientation } = props;

    return (
        <div
            className={classNames(
                "widget-rich-text-modal-body modal-dialog mx-window mx-window-active",
                { "form-vertical": formOrientation === "vertical" },
                className
            )}
        >
            <div className="modal-content mx-window-content">{children}</div>
        </div>
    );
}

export interface DialogHeaderProps extends PropsWithChildrenWithClass {
    onClose(): void;
}

export function DialogHeader(props: DialogHeaderProps): ReactElement {
    const { children, onClose, className } = props;

    return (
        <Fragment>
            <div className={classNames("widget-rich-text-modal-header modal-header", className)}>
                <button type="button" className="close" title="close" aria-label="close" onClick={onClose}>
                    ×
                </button>
                <h4>{children}</h4>
            </div>
            <div className="hide">{children}</div>
        </Fragment>
    );
}

export interface DialogBodyProps extends PropsWithChildrenWithClass {
    formOrientation: "horizontal" | "vertical";
}

export function DialogBody(props: DialogBodyProps): ReactElement {
    const { children, className, formOrientation } = props;

    return (
        <div
            className={classNames(
                "widget-rich-text-modal-content",
                {
                    "form-vertical": formOrientation === "vertical",
                    "form-horizontal": formOrientation !== "vertical"
                },
                className
            )}
        >
            {children}
        </div>
    );
}

export interface FormControlProps extends PropsWithChildrenWithClass {
    label?: string;
    formOrientation: "horizontal" | "vertical";
    inputId?: string;
}

export function FormControl(props: FormControlProps): ReactElement {
    const { children, className, label, formOrientation, inputId } = props;

    return (
        <If condition={children !== undefined && children !== null}>
            <div className={classNames("form-group", { "no-columns": formOrientation === "vertical" }, className)}>
                {label && (
                    <label
                        htmlFor={inputId}
                        id={`${inputId}-label`}
                        className={classNames("control-label", { "col-sm-3": formOrientation !== "vertical" })}
                    >
                        {label}
                    </label>
                )}
                {formOrientation === "vertical" ? (
                    children
                ) : (
                    <div className={`col-sm-${label ? "9" : "12"}`}>{children}</div>
                )}
            </div>
        </If>
    );
}

export interface DialogFooterProps extends PropsWithChildrenWithClass {
    onClose(): void;
    onSubmit(...args: any[]): void;
}

export function DialogFooter(props: DialogFooterProps): ReactElement {
    const { onSubmit, onClose, className } = props;

    return (
        <div className={classNames("mx-dataview-controls", className)}>
            <button type="button" className="btn mx-button btn-success" onClick={onSubmit}>
                Save
            </button>
            <button type="button" className="btn mx-button btn-default" onClick={onClose}>
                Cancel
            </button>
        </div>
    );
}
