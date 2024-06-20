import { createElement, useRef, ReactElement, useCallback, CSSProperties, useState } from "react";
import { RichTextContainerProps } from "typings/RichTextProps";
import Toolbar from "./Toolbar";
import { If } from "@mendix/widget-plugin-component-kit/If";
import Editor from "./Editor";
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import Quill, { Range } from "quill";
import classNames from "classnames";

export interface EditorWrapperProps extends RichTextContainerProps {
    editorHeight?: string | number;
    editorWidth?: string | number;
    style?: CSSProperties;
    className?: string;
}

export default function EditorWrapper(props: EditorWrapperProps): ReactElement {
    const {
        id,
        stringAttribute,
        style,
        className,
        preset,
        toolbarLocation,
        onChange,
        onChangeType,
        onBlur,
        onFocus,
        readOnlyStyle
    } = props;
    const quillRef = useRef<Quill>(null);
    const [isFocus, setIsFocus] = useState(false);
    const editorValueRef = useRef<string>("");

    const onTextChange = useCallback(() => {
        if (onChange?.canExecute && onChangeType === "onDataChange") {
            onChange.execute();
        }
    }, [onChange, onChangeType]);

    const onSelectionChange = useCallback(
        (range: Range) => {
            if (range) {
                // User cursor is selecting
                if (!isFocus) {
                    setIsFocus(true);
                    if (onFocus?.canExecute) {
                        onFocus.execute();
                    }

                    editorValueRef.current = quillRef.current?.getText() || "";
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [isFocus, onFocus, onBlur, onChange, onChangeType]
    );

    const toolbarId = `widget_${id.replaceAll(".", "_")}_toolbar`;
    const shouldHideToolbar = stringAttribute.readOnly && readOnlyStyle === "readPanel";
    return (
        <div
            className={classNames(className, `${stringAttribute?.readOnly ? `editor-${readOnlyStyle}` : ""}`, {
                "flex-column": toolbarLocation === "top",
                "flex-column-reverse": toolbarLocation === "bottom"
            })}
            style={{
                maxWidth: style?.maxWidth
            }}
            onClick={() => {
                quillRef?.current?.focus();
            }}
        >
            <If condition={!shouldHideToolbar}>
                <Toolbar id={toolbarId} preset={preset} />
            </If>
            <Editor
                theme={"snow"}
                ref={quillRef}
                defaultValue={stringAttribute.value}
                style={{
                    height: style?.height,
                    minHeight: style?.minHeight,
                    maxHeight: style?.maxHeight
                }}
                toolbarId={shouldHideToolbar ? undefined : toolbarId}
                onTextChange={onTextChange}
                onSelectionChange={onSelectionChange}
                className={"widget-rich-text-container"}
                readOnly={stringAttribute.readOnly}
                key={`${toolbarId}_${stringAttribute.readOnly}`}
            />
        </div>
    );
}
