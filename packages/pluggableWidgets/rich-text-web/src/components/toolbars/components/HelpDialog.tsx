import { ReactElement, useEffect, useRef } from "react";
import { useT } from "../../../utils/i18n";
import { SHORTCUT_CATEGORIES } from "../helpers/shortcuts";
import "./Dialog.scss";

export interface HelpDialogProps {
    onClose: () => void;
}

const TITLE_ID = "rich-text-help-dialog-title";

/**
 * Centered modal listing the editor's keyboard shortcuts (TinyMCE-style help).
 * Mirrors the ConfirmDialog pattern: overlay, click-outside to close, Escape to
 * close. Escape is scoped to this dialog and its propagation is stopped so the
 * fullscreen/editor Escape handlers don't also fire while the dialog is open.
 */
export function HelpDialog({ onClose }: HelpDialogProps): ReactElement {
    const dialogRef = useRef<HTMLDivElement>(null);
    const t = useT();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent): void => {
            if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        const handleKeyDown = (event: KeyboardEvent): void => {
            if (event.key === "Escape") {
                event.preventDefault();
                event.stopPropagation();
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown, true);

        // Move focus into the dialog on open.
        dialogRef.current?.focus();

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown, true);
        };
    }, [onClose]);

    return (
        <div className="confirm-dialog-overlay">
            <div
                ref={dialogRef}
                className="toolbar-dialog help-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby={TITLE_ID}
                tabIndex={-1}
            >
                <h3 id={TITLE_ID}>{t("help.title")}</h3>
                <div className="help-dialog-content">
                    {SHORTCUT_CATEGORIES.map(category => (
                        <div key={category.titleKey} className="help-category">
                            <h4 className="help-category-title">{t(category.titleKey)}</h4>
                            <ul className="help-shortcut-list">
                                {category.shortcuts.map(shortcut => (
                                    <li key={shortcut.labelKey} className="help-shortcut">
                                        <span className="help-shortcut-label">{t(shortcut.labelKey)}</span>
                                        <kbd className="help-shortcut-keys">{shortcut.keys}</kbd>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="dialog-actions">
                    <button type="button" onClick={onClose}>
                        {t("help.close")}
                    </button>
                </div>
            </div>
        </div>
    );
}
