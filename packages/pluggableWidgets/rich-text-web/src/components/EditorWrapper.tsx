import { createElement, useRef, ReactElement, useCallback, CSSProperties, useState, useEffect } from "react";
import { RichTextContainerProps } from "typings/RichTextProps";
import Toolbar from "./Toolbar";
import { If } from "@mendix/widget-plugin-component-kit/If";
import Editor from "./Editor";
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "../utils/themes/mendix";
import { StickySentinel } from "./StickySentinel";
import Quill, { Range } from "quill";
import classNames from "classnames";
import { createPreset } from "./CustomToolbars/presets";

export interface EditorWrapperProps extends RichTextContainerProps {
    editorHeight?: string | number;
    editorWidth?: string | number;
    style?: CSSProperties;
    className?: string;
    toolbarOptions?: Array<string | string[] | { [k: string]: any }>;
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
        readOnlyStyle,
        toolbarOptions,
        enableStatusBar
    } = props;
    const quillRef = useRef<Quill>(null);
    const [isFocus, setIsFocus] = useState(false);
    const editorValueRef = useRef<string>("");
    const toolbarRef = useRef<HTMLDivElement>(null);
    const [wordCount, setWordCount] = useState(0);

    const calculateWordCount = useCallback(
        (quill: Quill | null): void => {
            if (enableStatusBar) {
                const text = quill?.getText().trim();

                setWordCount(text && text.length > 0 ? text.split(/\s+/).length : 0);
            }
        },
        [enableStatusBar]
    );

    useEffect(() => {
        calculateWordCount(quillRef.current);
    }, [stringAttribute.value, calculateWordCount]);

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
    const shouldHideToolbar = stringAttribute.readOnly && readOnlyStyle !== "text";
    const toolbarPreset = shouldHideToolbar ? [] : createPreset(props);
    return (
        <div
            className={classNames(
                className,
                "flex-column",
                `${stringAttribute?.readOnly ? `editor-${readOnlyStyle}` : ""}`
            )}
            style={{
                maxWidth: style?.maxWidth
            }}
            onClick={e => {
                // click on other parts of editor, such as the toolbar, should also set focus
                if (
                    toolbarRef.current === (e.target as HTMLDivElement) ||
                    toolbarRef.current?.contains(e.target as Node)
                ) {
                    quillRef?.current?.focus();
                }
            }}
            spellCheck={props.spellCheck}
        >
            <StickySentinel />
            <div
                className={classNames(
                    "flexcontainer",
                    toolbarLocation === "bottom"
                        ? "flex-column-reverse"
                        : toolbarLocation === "auto"
                        ? "flex-column auto"
                        : "flex-column"
                )}
            >
                <If condition={!shouldHideToolbar && toolbarOptions === undefined}>
                    <Toolbar
                        ref={toolbarRef}
                        id={toolbarId}
                        preset={preset}
                        quill={quillRef.current}
                        toolbarContent={toolbarPreset}
                    />
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
                    toolbarId={shouldHideToolbar ? undefined : toolbarOptions ? toolbarOptions : toolbarId}
                    onTextChange={onTextChange}
                    onSelectionChange={onSelectionChange}
                    className={"widget-rich-text-container"}
                    readOnly={stringAttribute.readOnly}
                    key={`${toolbarId}_${stringAttribute.readOnly}`}
                />
            </div>
            {enableStatusBar && (
                <div className="widget-rich-text-footer">
                    {wordCount} word{wordCount > 1 ? "s" : ""}
                </div>
            )}
        </div>
    );
}
