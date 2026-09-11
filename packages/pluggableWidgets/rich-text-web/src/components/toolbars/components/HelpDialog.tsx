import { ReactElement } from "react";
import { DialogShell } from "./DialogShell";
import { useT } from "../../../utils/i18n";
import { SHORTCUT_CATEGORIES } from "../helpers/shortcuts";
import "./Dialog.scss";

export interface HelpDialogProps {
    onClose: () => void;
}

const TITLE_ID = "rich-text-help-dialog-title";

/**
 * Centered modal listing the editor's keyboard shortcuts (TinyMCE-style help).
 * Always focused, whatever the widget's "Dialog style" is set to: it is a reference panel with no
 * anchor to attach to. Overlay, click-outside, Escape (whose propagation is stopped so the
 * fullscreen/editor Escape handlers don't also fire) and focus handling all come from DialogShell.
 */
export function HelpDialog({ onClose }: HelpDialogProps): ReactElement {
    const t = useT();

    return (
        <DialogShell mode="focused" onClose={onClose} className="help-dialog" ariaLabelledBy={TITLE_ID}>
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
                <button type="button" className="btn" onClick={onClose}>
                    {t("help.close")}
                </button>
            </div>
        </DialogShell>
    );
}
