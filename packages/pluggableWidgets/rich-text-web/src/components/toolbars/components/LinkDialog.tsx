import { useFloating, offset, flip, shift } from "@floating-ui/react";
import { ReactElement, useState, FormEvent, useRef, useEffect } from "react";
import { useCurrentEditor } from "../../EditorContext";
import { LinkDialogProps } from "../helpers/toolbarTypes";
import "./Dialog.scss";

export function LinkDialog({ onClose, referenceElement }: LinkDialogProps): ReactElement {
    const { editor } = useCurrentEditor();

    // Get initial values from editor state
    const existingLink = editor?.getAttributes("link") || {};
    const { from, to } = editor?.state.selection || { from: 0, to: 0 };
    const selectedText = editor?.state.doc.textBetween(from, to, " ") || "";

    const [url, setUrl] = useState(existingLink.href || "");
    const [text, setText] = useState(selectedText);
    const [title, setTitle] = useState(existingLink.title || "");
    const [target, setTarget] = useState<"_self" | "_blank">(
        (existingLink.target === "_blank" ? "_blank" : "_self") as "_self" | "_blank"
    );

    const urlInputRef = useRef<HTMLInputElement>(null);
    const dialogRef = useRef<HTMLDivElement>(null);

    const { x, y, strategy, refs } = useFloating({
        placement: "bottom-start",
        strategy: "fixed",
        middleware: [offset(4), flip(), shift({ padding: 8 })],
        elements: {
            reference: referenceElement
        }
    });

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent): void => {
            if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    useEffect(() => {
        // Focus URL input when dialog opens
        urlInputRef.current?.focus();
    }, []);

    const handleSubmit = (e: FormEvent): void => {
        e.preventDefault();
        if (!editor || !url.trim()) return;

        const urlValue = url.trim();
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
        <div
            ref={refs.setFloating}
            style={{
                position: strategy,
                top: y ?? 0,
                left: x ?? 0,
                zIndex: 1000
            }}
        >
            <div ref={dialogRef} className="toolbar-dialog">
                <form onSubmit={handleSubmit}>
                    <h3>{existingLink.href ? "Edit Link" : "Insert Link"}</h3>

                    <div className="dialog-field">
                        <label htmlFor="link-url">URL</label>
                        <input
                            ref={urlInputRef}
                            id="link-url"
                            type="text"
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                            placeholder="https://example.com"
                            autoFocus
                        />
                    </div>

                    <div className="dialog-field">
                        <label htmlFor="link-text">Text (optional)</label>
                        <input
                            id="link-text"
                            type="text"
                            value={text}
                            onChange={e => setText(e.target.value)}
                            placeholder="Link text"
                        />
                    </div>

                    <div className="dialog-field">
                        <label htmlFor="link-title">Title (optional)</label>
                        <input
                            id="link-title"
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Tooltip text"
                        />
                    </div>

                    <div className="dialog-field">
                        <label>Target</label>
                        <div className="dialog-radio-group">
                            <label>
                                <input
                                    type="radio"
                                    name="target"
                                    value="_self"
                                    checked={target === "_self"}
                                    onChange={e => setTarget(e.target.value as "_self")}
                                />
                                <span>Current window</span>
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="target"
                                    value="_blank"
                                    checked={target === "_blank"}
                                    onChange={e => setTarget(e.target.value as "_blank")}
                                />
                                <span>New window</span>
                            </label>
                        </div>
                    </div>

                    <div className="dialog-actions">
                        <button type="button" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" disabled={!url.trim()}>
                            {existingLink.href ? "Update" : "Insert"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
