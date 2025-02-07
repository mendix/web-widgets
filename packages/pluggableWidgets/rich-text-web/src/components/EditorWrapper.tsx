import { If } from "@mendix/widget-plugin-component-kit/If";
import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import { debounce } from "@mendix/widget-plugin-platform/utils/debounce";
import classNames from "classnames";
import Quill, { Range } from "quill";
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import { createElement, CSSProperties, ReactElement, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RichTextContainerProps } from "typings/RichTextProps";
import { updateLegacyQuillFormats } from "../utils/helpers";
import MendixTheme from "../utils/themes/mxTheme";
import { createPreset } from "./CustomToolbars/presets";
import Editor from "./Editor";
import { StickySentinel } from "./StickySentinel";
import Toolbar from "./Toolbar";

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
        onLoad,
        readOnlyStyle,
        toolbarOptions,
        enableStatusBar,
        tabIndex
    } = props;
    const isFirstLoad = useRef<boolean>(false);
    const quillRef = useRef<Quill>(null);
    const [isFocus, setIsFocus] = useState(false);
    const editorValueRef = useRef<string>("");
    const toolbarRef = useRef<HTMLDivElement>(null);
    const [wordCount, setWordCount] = useState(0);
    const [setAttributeValueDebounce] = useMemo(
        () =>
            debounce(string => {
                if (stringAttribute.value !== string) {
                    stringAttribute.setValue(string);
                    if (onChangeType === "onDataChange") {
                        executeAction(onChange);
                    }
                }
            }, 200),
        [stringAttribute, onChange, onChangeType]
    );
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
        if (quillRef.current) {
            calculateWordCount(quillRef.current);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stringAttribute.value, calculateWordCount, quillRef.current]);

    useEffect(() => {
        if (quillRef.current) {
            const isTransformed = updateLegacyQuillFormats(quillRef.current);
            if (isTransformed) {
                setAttributeValueDebounce(quillRef.current.getSemanticHTML());
            }
            if (!isFirstLoad.current) {
                executeAction(onLoad);
                isFirstLoad.current = true;
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [quillRef.current]);

    const onTextChange = useCallback(() => {
        setAttributeValueDebounce(quillRef?.current?.getSemanticHTML());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [quillRef.current, stringAttribute]);

    const onSelectionChange = useCallback(
        (range: Range) => {
            if (range) {
                // User cursor is selecting
                if (!isFocus) {
                    setIsFocus(true);
                    executeAction(onFocus);
                    editorValueRef.current = quillRef.current?.getText() || "";
                }
            } else {
                // Cursor not in the editor
                if (isFocus) {
                    setIsFocus(false);
                    executeAction(onBlur);

                    if (onChangeType === "onLeave") {
                        if (editorValueRef.current !== quillRef.current?.getText()) {
                            executeAction(onChange);
                        }
                    }
                }
            }
            (quillRef.current?.theme as MendixTheme).updateFontPicker(range);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [isFocus, onFocus, onBlur, onChange, onChangeType]
    );

    const toolbarId = `widget_${id.replaceAll(".", "_")}_toolbar`;
    const shouldHideToolbar = (stringAttribute.readOnly && readOnlyStyle !== "text") || toolbarLocation === "hide";
    const toolbarPreset = shouldHideToolbar ? [] : createPreset(props);
    return (
        <div
            className={classNames(
                className,
                "flex-column",
                `${stringAttribute?.readOnly ? `editor-${readOnlyStyle}` : ""}`
            )}
            style={{ width: style?.width }}
            onClick={e => {
                // click on other parts of editor, such as the toolbar, should also set focus
                if (!quillRef?.current?.hasFocus()) {
                    if (
                        toolbarRef.current === (e.target as HTMLDivElement) ||
                        toolbarRef.current?.contains(e.target as Node) ||
                        e.target === quillRef?.current?.container.parentElement
                    ) {
                        quillRef?.current?.focus();
                    }
                }
            }}
            spellCheck={props.spellCheck}
            tabIndex={tabIndex}
        >
            {toolbarLocation === "auto" && <StickySentinel />}
            <div
                className={classNames(
                    "flexcontainer",
                    toolbarLocation === "bottom" ? "flex-column-reverse" : "flex-column"
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
                        maxHeight: style?.maxHeight,
                        overflowY: style?.overflowY
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
                <div className="widget-rich-text-footer" tabIndex={-1}>
                    {wordCount} word{wordCount > 1 ? "s" : ""}
                </div>
            )}
        </div>
    );
}
