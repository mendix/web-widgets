import classNames from "classnames";
import { createElement, PropsWithChildren, ReactElement } from "react";

interface PropsWithChildrenWithClass extends PropsWithChildren {
    className?: string;
}

export function DialogContent(props: PropsWithChildrenWithClass): ReactElement {
    const { children, className } = props;

    return (
        <div
            className={classNames("widget-rich-text-modal-body modal-content mx-window-content link-dialog", className)}
        >
            {children}
        </div>
    );
}

export interface DialogHeaderProps extends PropsWithChildrenWithClass {
    onClose(): void;
}

export function DialogHeader(props: DialogHeaderProps): ReactElement {
    const { children, onClose, className } = props;

    return (
        <div className={classNames("widget-rich-text-modal-header modal-header", className)}>
            <button type="button" className="close" title="close" aria-label="close" onClick={onClose}>
                ×
            </button>
            <h4>{children}</h4>
        </div>
    );
}

export function DialogBody(props: PropsWithChildrenWithClass): ReactElement {
    const { children, className } = props;

    return <div className={classNames("widget-rich-text-modal-content form-horizontal", className)}>{children}</div>;
}

export interface FormControlProps extends PropsWithChildrenWithClass {
    label: string;
}

export function FormControl(props: FormControlProps): ReactElement {
    const { children, className, label } = props;

    return (
        <div className={classNames("form-group", className)}>
            <label className="control-label col-sm-3">{label}</label>
            <div className="col-sm-9"> {children}</div>
        </div>
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
