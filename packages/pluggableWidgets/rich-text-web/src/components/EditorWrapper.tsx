import { If } from "@mendix/widget-plugin-component-kit/If";
import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import { debounce } from "@mendix/widget-plugin-platform/utils/debounce";
import classNames from "classnames";
import Quill, { Range } from "quill";
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import {
    createElement,
    CSSProperties,
    ReactElement,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";
import { RichTextContainerProps } from "typings/RichTextProps";
import { EditorContext, EditorProvider } from "../store/EditorProvider";
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

function EditorWrapperInner(props: EditorWrapperProps): ReactElement {
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
        statusBarContent,
        tabIndex,
        imageSource,
        imageSourceContent,
        enableDefaultUpload,
        formOrientation
    } = props;

    const globalState = useContext(EditorContext);

    const isFirstLoad = useRef<boolean>(false);
    const quillRef = useRef<Quill>(null);
    const [isFocus, setIsFocus] = useState(false);
    const editorValueRef = useRef<string>("");
    const toolbarRef = useRef<HTMLDivElement>(null);
    const [wordCount, setWordCount] = useState(0);
    const [characterCount, setCharacterCount] = useState(0);
    const [characterCountHtml, setCharacterCountHtml] = useState(0);

    const { isFullscreen } = globalState;

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

    const calculateCharacterCount = useCallback(
        (quill: Quill | null): void => {
            if (enableStatusBar && (statusBarContent === "characterCount" || statusBarContent === "both")) {
                const text = quill?.getText() || "";
                setCharacterCount(text.length);
            }
        },
        [enableStatusBar, statusBarContent]
    );

    const calculateCharacterCountHtml = useCallback(
        (quill: Quill | null): void => {
            if (enableStatusBar && (statusBarContent === "characterCountHtml" || statusBarContent === "both")) {
                const html = quill?.getSemanticHTML() || "";
                setCharacterCountHtml(html.length);
            }
        },
        [enableStatusBar, statusBarContent]
    );

    const calculateCounts = useCallback(
        (quill: Quill | null): void => {
            calculateWordCount(quill);
            calculateCharacterCount(quill);
            calculateCharacterCountHtml(quill);
        },
        [calculateWordCount, calculateCharacterCount, calculateCharacterCountHtml]
    );

    useEffect(() => {
        if (quillRef.current) {
            calculateCounts(quillRef.current);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stringAttribute.value, calculateCounts, quillRef.current]);

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
        calculateCounts(quillRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [quillRef.current, stringAttribute, calculateCounts]);

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
                `${stringAttribute?.readOnly ? `editor-${readOnlyStyle}` : ""}`,
                { fullscreen: isFullscreen }
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
                    toolbarLocation === "bottom" ? "flex-column-reverse" : "flex-column",
                    { "hide-toolbar": shouldHideToolbar }
                )}
            >
                <If condition={!shouldHideToolbar && toolbarOptions === undefined}>
                    <Toolbar
                        ref={toolbarRef}
                        id={toolbarId}
                        preset={preset}
                        quill={quillRef.current}
                        toolbarContent={toolbarPreset}
                        customFonts={props.customFonts}
                    />
                </If>
                <Editor
                    theme={"snow"}
                    ref={quillRef}
                    defaultValue={stringAttribute.value}
                    style={
                        isFullscreen
                            ? { height: "100%" }
                            : {
                                  height: style?.height,
                                  minHeight: style?.minHeight,
                                  maxHeight: style?.maxHeight,
                                  overflowY: style?.overflowY
                              }
                    }
                    toolbarId={shouldHideToolbar ? undefined : toolbarOptions ? toolbarOptions : toolbarId}
                    onTextChange={onTextChange}
                    onSelectionChange={onSelectionChange}
                    className={"widget-rich-text-container"}
                    readOnly={stringAttribute.readOnly}
                    key={`${toolbarId}_${stringAttribute.readOnly}`}
                    customFonts={props.customFonts}
                    imageSource={imageSource}
                    imageSourceContent={imageSourceContent}
                    enableDefaultUpload={enableDefaultUpload}
                    formOrientation={formOrientation}
                />
            </div>
            {enableStatusBar && (
                <div className="widget-rich-text-footer" tabIndex={-1}>
                    {statusBarContent === "wordCount" && (
                        <span>{wordCount} word{wordCount === 1 ? "" : "s"}</span>
                    )}
                    {statusBarContent === "characterCount" && (
                        <span>{characterCount} character{characterCount === 1 ? "" : "s"}</span>
                    )}
                    {statusBarContent === "characterCountHtml" && (
                        <span>{characterCountHtml} character{characterCountHtml === 1 ? "" : "s"} (with HTML)</span>
                    )}
                    {statusBarContent === "both" && (
                        <span>
                            {wordCount} word{wordCount === 1 ? "" : "s"} • {characterCount} character{characterCount === 1 ? "" : "s"}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}

export default function EditorWrapper(props: EditorWrapperProps): ReactElement {
    return (
        <EditorProvider>
            <EditorWrapperInner {...props} />
        </EditorProvider>
    );
}
