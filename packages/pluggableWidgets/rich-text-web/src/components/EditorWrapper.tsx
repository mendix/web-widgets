import { createElement, useRef, ReactElement, useCallback, CSSProperties, useState } from "react";
import { Range } from "quill";
import { RichTextContainerProps } from "typings/RichTextProps";
import Toolbar from "./Toolbar";
import Editor from "./Editor";
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import Quill from "quill";
import classNames from "classnames";

export interface EditorWrapperProps extends RichTextContainerProps {
    editorHeight?: string | number;
    editorWidth?: string | number;
    style?: CSSProperties;
    className?: string;
}

export default function EditorWrapper(props: EditorWrapperProps): ReactElement {
    const { id, stringAttribute, style, className, preset, toolbarLocation, onChange, onChangeType, onBlur, onFocus } =
        props;
    const quillRef = useRef<Quill>(null);
    const [isFocus, setIsFocus] = useState(false);
    const editorValueRef = useRef<string>("");

    const onTextChange = useCallback(() => {
        if (onChange?.canExecute && onChangeType === "onDataChange") {
            onChange.execute();
        }
    }, []);

    const onSelectionChange = useCallback(
        (range: Range) => {
            if (range) {
                if (!isFocus) {
                    setIsFocus(true);
                    if (onFocus?.canExecute) {
                        onFocus.execute();
                    }

                    editorValueRef.current = quillRef.current?.getText() || "";
                }
                if (range.length == 0) {
                    // User cursor is on specific index
                    //   console.log(, range.index);
                } else {
                    // User cursor is selecting some values
                }
            } else {
                // Cursor not in the editor

                if (isFocus) {
                    setIsFocus(false);
                    if (onBlur?.canExecute) {
                        onBlur.execute();
                    }

                    if (onChange?.canExecute && onChangeType === "onLeave") {
                        if (editorValueRef.current !== quillRef.current?.getText()) {
                            onChange.execute();
                        }
                    }

                    stringAttribute.setValue(quillRef?.current?.getSemanticHTML());
                }
            }
        },
        [isFocus]
    );

    const toolbarId = `widget_${id.replaceAll(".", "_")}_toolbar`;

    return (
        <div
            className={classNames(className, {
                "flex-column": toolbarLocation === "top",
                "flex-column-reverse": toolbarLocation === "bottom"
            })}
        >
            <Toolbar id={toolbarId} preset={preset} />
            <Editor
                theme={"snow"}
                ref={quillRef}
                defaultValue={stringAttribute.value}
                style={style}
                toolbarId={toolbarId}
                onTextChange={onTextChange}
                onSelectionChange={onSelectionChange}
            />
        </div>
    );
}
