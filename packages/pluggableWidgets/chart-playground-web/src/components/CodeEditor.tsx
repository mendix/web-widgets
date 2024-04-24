import { createElement } from "react";
import Editor from "@monaco-editor/react";

export type EditorChangeHandler = (value: string) => void;

export interface CodeEditorProps {
    defaultValue: string;
    onChange: EditorChangeHandler;
}

export function CodeEditor(props: CodeEditorProps): React.ReactElement {
    return <Editor language="json" defaultValue={props.defaultValue} onChange={props.onChange} />;
}
