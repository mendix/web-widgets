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
    const [isFullscreen, setIsFullscreen] = useState(false);
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
        if (stringAttribute.value !== quillRef?.current?.getSemanticHTML()) {
            setAttributeValueDebounce(quillRef?.current?.getSemanticHTML());
        }
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
            (quillRef.current?.theme as MendixTheme).updatePicker(range);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [isFocus, onFocus, onBlur, onChange, onChangeType]
    );

    // Add fullscreen toggle handler
    const toggleFullscreen = useCallback(() => {
        setIsFullscreen(prevState => {
            const newState = !prevState;
            if (newState) {
                const currentBodyOverflow = document.body.style.overflow;
                document.body.dataset.previousOverflow = currentBodyOverflow;
                document.body.style.overflow = "hidden";
                document.body.classList.add("widget-rich-text-body-fullscreen");
            } else {
                const previousOverflow = document.body.dataset.previousOverflow || "";
                document.body.style.overflow = previousOverflow;
                delete document.body.dataset.previousOverflow;
                document.body.classList.remove("widget-rich-text-body-fullscreen");
            }
            return newState;
        });
    }, []);

    // Add escape key listener for fullscreen mode
    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === "Escape" && isFullscreen) {
                setIsFullscreen(false);
                const previousOverflow = document.body.dataset.previousOverflow || "";
                document.body.style.overflow = previousOverflow;
                delete document.body.dataset.previousOverflow;
                document.body.classList.remove("widget-rich-text-body-fullscreen");
            }
        };

        document.addEventListener("keydown", handleEscapeKey);
        return () => {
            document.removeEventListener("keydown", handleEscapeKey);
            if (isFullscreen) {
                const previousOverflow = document.body.dataset.previousOverflow || "";
                document.body.style.overflow = previousOverflow;
                delete document.body.dataset.previousOverflow;
                document.body.classList.remove("widget-rich-text-body-fullscreen");
            }
        };
    }, [isFullscreen]);

    const toolbarId = `widget_${id.replaceAll(".", "_")}_toolbar`;
    const shouldHideToolbar = (stringAttribute.readOnly && readOnlyStyle !== "text") || toolbarLocation === "hide";
    const toolbarPreset = shouldHideToolbar ? [] : createPreset(props);

    // Create a custom handler for the fullscreen button
    const customHandlers = {
        fullscreen: toggleFullscreen
    };

    return (
        <div
            className={classNames(
                className,
                "flex-column",
                `${stringAttribute?.readOnly ? `editor-${readOnlyStyle}` : ""}`,
                isFullscreen ? "widget-rich-text-fullscreen" : ""
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
            {isFullscreen && (
                <button className="widget-rich-text-fullscreen-close" onClick={toggleFullscreen}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ marginRight: "5px" }}
                    >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    Exit Fullscreen
                </button>
            )}
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
                        customHandlers={customHandlers}
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
