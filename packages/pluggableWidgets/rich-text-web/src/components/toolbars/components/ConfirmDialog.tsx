import { ReactElement } from "react";
import { DialogShell } from "./DialogShell";
import { ConfirmDialogProps } from "../helpers/toolbarTypes";
import "./Dialog.scss";

/**
 * Always focused, whatever the widget's "Dialog style" is set to: it asks a blocking question and
 * has no toolbar button to anchor to.
 */
export function ConfirmDialog({
    title,
    message,
    confirmLabel = "Save",
    cancelLabel = "Cancel",
    onConfirm,
    onCancel
}: ConfirmDialogProps): ReactElement {
    return (
        <DialogShell mode="focused" onClose={onCancel} className="confirm-dialog">
            {title && <h3>{title}</h3>}
            {message && (
                <div className="dialog-scroll">
                    <p className="confirm-message">{message}</p>
                </div>
            )}
            <div className="dialog-actions">
                <button type="button" onClick={onCancel}>
                    {cancelLabel}
                </button>
                <button type="button" className="btn-primary" onClick={onConfirm}>
                    {confirmLabel}
                </button>
            </div>
        </DialogShell>
    );
}
