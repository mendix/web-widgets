import { ReactElement, useState, FormEvent, useRef } from "react";
import { DialogShell } from "./DialogShell";
import { isSafeLinkUrl } from "../../../utils/helpers";
import { useT } from "../../../utils/i18n";
import { useCurrentEditor } from "../../EditorContext";
import { LinkDialogProps } from "../helpers/toolbarTypes";
import "./Dialog.scss";

const TITLE_ID = "rich-text-link-dialog-title";

export function LinkDialog({ onClose, referenceElement }: LinkDialogProps): ReactElement {
    const { editor, dialogStyle } = useCurrentEditor();
    const t = useT();

    // Get initial values from editor state
    const existingLink = editor?.getAttributes("link") || {};
    const { from, to } = editor?.state.selection || { from: 0, to: 0 };
    const selectedText = editor?.state.doc.textBetween(from, to, " ") || "";

    const [url, setUrl] = useState(existingLink.href || "");
    const [urlError, setUrlError] = useState<string | null>(null);
    const [text, setText] = useState(selectedText);
    const [title, setTitle] = useState(existingLink.title || "");
    const [target, setTarget] = useState<"_self" | "_blank">(
        (existingLink.target === "_blank" ? "_blank" : "_self") as "_self" | "_blank"
    );

    // Only used to return focus after a rejected URL. Focus on open comes from the input's
    // `autoFocus`: the dialog is portalled, so a mount-time effect here would run before the input
    // exists.
    const urlInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: FormEvent): void => {
        e.preventDefault();
        if (!editor || !url.trim()) return;

        const urlValue = url.trim();

        // Reject dangerous schemes (javascript:, data:, vbscript:, …) before building the mark.
        if (!isSafeLinkUrl(urlValue)) {
            setUrlError(t("link.urlError"));
            urlInputRef.current?.focus();
            return;
        }

        const textValue = text.trim();
        const titleValue = title.trim() || undefined;

        if (selectedText) {
            // Has existing selection - apply link to it (or replace with new text if provided)
            if (textValue && textValue !== selectedText) {
                // Replace selection with new text and apply link
                editor
                    .chain()
                    .focus()
                    .deleteSelection()
                    .insertContent({
                        type: "text",
                        text: textValue,
                        marks: [{ type: "link", attrs: { href: urlValue, title: titleValue, target } }]
                    })
                    .run();
            } else {
                // Apply link to existing selection
                editor.chain().focus().setLink({ href: urlValue, title: titleValue, target }).run();
            }
        } else {
            // No selection - insert new text with link
            const linkText = textValue || urlValue;
            editor
                .chain()
                .focus()
                .insertContent({
                    type: "text",
                    text: linkText,
                    marks: [{ type: "link", attrs: { href: urlValue, title: titleValue, target } }]
                })
                .run();
        }

        onClose();
    };

    return (
        <DialogShell mode={dialogStyle} onClose={onClose} referenceElement={referenceElement} ariaLabelledBy={TITLE_ID}>
            <form className="dialog-layout" onSubmit={handleSubmit}>
                <h3 id={TITLE_ID}>{existingLink.href ? t("link.editTitle") : t("link.insertTitle")}</h3>

                <div className="dialog-scroll">
                    <div className="dialog-field">
                        <label htmlFor="link-url">{t("link.url")}</label>
                        <input
                            ref={urlInputRef}
                            id="link-url"
                            type="text"
                            value={url}
                            onChange={e => {
                                setUrl(e.target.value);
                                if (urlError) {
                                    setUrlError(null);
                                }
                            }}
                            placeholder={t("link.urlPlaceholder")}
                            aria-invalid={urlError ? true : undefined}
                            aria-describedby={urlError ? "link-url-error" : undefined}
                            autoFocus
                        />
                        {urlError && (
                            <span id="link-url-error" className="dialog-field-error" role="alert">
                                {urlError}
                            </span>
                        )}
                    </div>

                    <div className="dialog-field">
                        <label htmlFor="link-text">
                            {t("link.text")} <span>{t("link.optional")}</span>
                        </label>
                        <input
                            id="link-text"
                            type="text"
                            value={text}
                            onChange={e => setText(e.target.value)}
                            placeholder={t("link.textPlaceholder")}
                        />
                    </div>

                    <div className="dialog-field">
                        <label htmlFor="link-title">
                            {t("link.title")} <span>{t("link.optional")}</span>
                        </label>
                        <input
                            id="link-title"
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder={t("link.titlePlaceholder")}
                        />
                    </div>

                    <div className="dialog-field">
                        <label>{t("link.target")}</label>
                        <div className="dialog-radio-group">
                            <label>
                                <input
                                    type="radio"
                                    name="target"
                                    value="_self"
                                    checked={target === "_self"}
                                    onChange={e => setTarget(e.target.value as "_self")}
                                />
                                <span>{t("link.currentWindow")}</span>
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="target"
                                    value="_blank"
                                    checked={target === "_blank"}
                                    onChange={e => setTarget(e.target.value as "_blank")}
                                />
                                <span>{t("link.newWindow")}</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="dialog-actions">
                    <button type="button" onClick={onClose}>
                        {t("link.cancel")}
                    </button>
                    <button type="submit" disabled={!url.trim()}>
                        {existingLink.href ? t("link.update") : t("link.insert")}
                    </button>
                </div>
            </form>
        </DialogShell>
    );
}
