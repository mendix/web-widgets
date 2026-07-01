import { ReactElement, useRef, useEffect } from "react";
import { ConfirmDialogProps } from "../helpers/toolbarTypes";
import "./Dialog.scss";

export function ConfirmDialog({
    title,
    message,
    confirmLabel = "Save",
    cancelLabel = "Cancel",
    onConfirm,
    onCancel
}: ConfirmDialogProps): ReactElement {
    const dialogRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent): void => {
            if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
                onCancel();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onCancel]);

    return (
        <div className="confirm-dialog-overlay">
            <div ref={dialogRef} className="toolbar-dialog confirm-dialog">
                <h3>{title}</h3>
                <p className="confirm-message">{message}</p>
                <div className="dialog-actions">
                    <button type="button" onClick={onCancel}>
                        {cancelLabel}
                    </button>
                    <button type="button" className="btn-primary" onClick={onConfirm}>
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
