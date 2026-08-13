import hljs from "highlight.js/lib/core";
import json from "highlight.js/lib/languages/json";
import { ClipboardEvent, ReactElement, useRef } from "react";
import Editor from "react-simple-code-editor";
import "highlight.js/styles/atom-one-light.css";

hljs.registerLanguage("json", json);

export interface CodeEditorProps {
    value: string;
    onChange?: (value: string) => void;
    readOnly?: boolean;
    height?: string;
}

function highlight(code: string): string {
    try {
        return hljs.highlight(code, { language: "json", ignoreIllegals: true }).value;
    } catch (error) {
        console.warn("Syntax highlighting error:", error);
        return code;
    }
}

function jsonError(code: string): string | null {
    if (code.trim() === "") {
        return null;
    }
    try {
        JSON.parse(code);
        return null;
    } catch (error) {
        return error instanceof Error ? error.message : "Invalid JSON";
    }
}

export function CodeEditor(props: CodeEditorProps): ReactElement {
    const error = jsonError(props.value);
    const containerRef = useRef<HTMLDivElement>(null);

    const onPaste = (event: ClipboardEvent<HTMLDivElement>): void => {
        const textarea = event.target;
        if (!(textarea instanceof HTMLTextAreaElement)) {
            return;
        }
        const replacesWholeValue = textarea.selectionStart === 0 && textarea.selectionEnd === textarea.value.length;
        if (!replacesWholeValue) {
            return;
        }
        // Pasting over the entire value lands the caret (and scroll position) at the end of
        // the pasted text, same as any textarea. For a config the user is about to read
        // top-to-bottom, jump back to the start instead.
        requestAnimationFrame(() => {
            textarea.setSelectionRange(0, 0);
            textarea.scrollTop = 0;
            const wrapper = containerRef.current;
            if (wrapper) {
                wrapper.scrollTop = 0;
            }
        });
    };

    return (
        <div
            ref={containerRef}
            className="widget-charts-playground-code-editor"
            style={{ height: props.height ?? "200px" }}
            onPaste={onPaste}
        >
            {error && (
                <div className="widget-charts-playground-code-editor-error" role="alert">
                    {error}
                </div>
            )}
            <Editor
                value={props.value}
                onValueChange={value => props.onChange?.(value)}
                highlight={highlight}
                disabled={props.readOnly}
                padding={8}
                tabSize={2}
                insertSpaces
                ignoreTabKey={false}
                spellCheck={false}
                style={{
                    width: "100%",
                    minHeight: "100%",
                    fontFamily: "monospace"
                }}
            />
        </div>
    );
}
