import { createElement, useRef, ReactElement, useCallback } from "react";
import { RichTextContainerProps } from "typings/RichTextProps";
import Editor from "./Editor";
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import Quill from "quill";

export interface EditorWrapperProps extends RichTextContainerProps {
    editorHeight?: string | number;
    editorWidth?: string | number;
}

export default function EditorWrapper(props: EditorWrapperProps): ReactElement {
    const { stringAttribute } = props;
    const quillRef = useRef<Quill>(null);

    const onTextChange = useCallback(() => {
        stringAttribute.setValue(quillRef?.current?.getSemanticHTML());
    }, []);

    return <Editor ref={quillRef} defaultValue={stringAttribute.value} onTextChange={onTextChange} />;
}
