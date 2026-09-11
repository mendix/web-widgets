import { ReactElement } from "react";
import { DialogShell } from "./DialogShell";
import { ConfirmDialogProps } from "../helpers/toolbarTypes";
import "./Dialog.scss";

const TITLE_ID = "rich-text-confirm-dialog-title";
const FALLBACK_TITLE = "Confirmation";

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
        <DialogShell mode="focused" onClose={onCancel} className="confirm-dialog" ariaLabelledBy={TITLE_ID}>
            {title ? (
                <h3 id={TITLE_ID}>{title}</h3>
            ) : (
                <span id={TITLE_ID} className="dialog-visually-hidden">
                    {FALLBACK_TITLE}
                </span>
            )}
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
