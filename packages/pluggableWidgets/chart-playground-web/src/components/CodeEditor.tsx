import hljs from "highlight.js/lib/core";
import json from "highlight.js/lib/languages/json";
import { ReactElement } from "react";
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

    return (
        <div className="widget-charts-playground-code-editor">
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
                style={{ height: props.height ?? "200px", width: "100%", fontFamily: "monospace" }}
            />
        </div>
    );
}
