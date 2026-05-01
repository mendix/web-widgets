import { ReactElement } from "react";

export interface CodeEditorProps {
    value: string;
    onChange?: (value: string) => void;
    readOnly?: boolean;
    height?: string;
}

export function CodeEditor(props: CodeEditorProps): ReactElement {
    return (
        <textarea
            value={props.value}
            onChange={e => props.onChange?.(e.target.value)}
            style={{ height: props.height ?? "200px", width: "100%", fontFamily: "monospace" }}
            readOnly={props.readOnly}
        />
    );
}
