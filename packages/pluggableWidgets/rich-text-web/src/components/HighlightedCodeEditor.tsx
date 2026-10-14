import classNames from "classnames";
import hljs from "highlight.js/lib/core";
import xml from "highlight.js/lib/languages/xml";
import { CSSProperties, ReactElement } from "react";
import Editor from "react-simple-code-editor";
import "highlight.js/styles/atom-one-light.css";

// Register HTML language (uses XML parser)
hljs.registerLanguage("html", xml);

export interface HighlightedCodeEditorProps {
    value: string;
    onChange: (value: string) => void;
    readOnly?: boolean;
    className?: string;
    style?: CSSProperties;
}

export function HighlightedCodeEditor({
    value,
    onChange,
    readOnly = false,
    className,
    style
}: HighlightedCodeEditorProps): ReactElement {
    const highlight = (code: string): string => {
        try {
            return hljs.highlight(code, {
                language: "html",
                ignoreIllegals: true
            }).value;
        } catch (error) {
            console.warn("Syntax highlighting error:", error);
            return code;
        }
    };

    return (
        <div className="highlighted-code-editor-wrapper" style={style}>
            <Editor
                value={value}
                onValueChange={onChange}
                highlight={highlight}
                padding={12}
                disabled={readOnly}
                className={classNames("highlighted-code-editor", className)}
                tabSize={2}
                insertSpaces
                ignoreTabKey={false}
                spellCheck={false}
            />
        </div>
    );
}
