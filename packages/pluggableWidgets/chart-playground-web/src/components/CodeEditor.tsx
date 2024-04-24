import { json, jsonParseLinter } from "@codemirror/lang-json";
import { linter, lintGutter } from "@codemirror/lint";
import { githubLight } from "@uiw/codemirror-theme-github";
import CodeMirror, { type Extension } from "@uiw/react-codemirror";
import { createElement, useEffect, useMemo, useRef, useState } from "react";

export type EditorChangeHandler = (value: string) => void;

export interface CodeEditorProps {
    defaultValue: string;
    onChange?: EditorChangeHandler;
    readOnly?: boolean;
    height?: string;
}

export function CodeEditor(props: CodeEditorProps): React.ReactElement {
    const [value, onChange] = useEditorState({ initState: props.defaultValue, onChange: props.onChange });
    const extensions = useMemo<Extension[]>(
        () => [
            json(),
            linter(jsonParseLinter(), {
                // default is 750ms
                delay: 300
            }),
            lintGutter()
        ],
        []
    );
    return (
        <CodeMirror
            height={props.height}
            value={value}
            onChange={onChange}
            theme={githubLight}
            readOnly={props.readOnly}
            extensions={extensions}
        />
    );
}

function useEditorState(params: { initState: string; onChange?: EditorChangeHandler }): [string, EditorChangeHandler] {
    const listener = useRef(params.onChange);
    const [value, setValue] = useState(params.initState);
    const { current: onValueChange } = useRef<EditorChangeHandler>(value => {
        setValue(value);
        listener.current?.(value);
    });
    useEffect(() => {
        listener.current = params.onChange;
    });
    return [value, onValueChange];
}
