import type { Editor as TipTapEditor } from "@tiptap/core";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { TableRow } from "@tiptap/extension-table-row";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import { TextStyle } from "@tiptap/extension-text-style";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import {
    CSSProperties,
    forwardRef,
    ReactElement,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState
} from "react";
import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import { EditorContextProvider, useCurrentEditor } from "./EditorContext";
import { HighlightedCodeEditor } from "./HighlightedCodeEditor";
import { LinkBubbleMenu } from "./LinkBubbleMenu";
import { Toolbar } from "./toolbars";
import { RichTextContainerProps } from "../../typings/RichTextProps";
import { BulletListStyled } from "../extensions/BulletListStyled";
import { FontFamilyClass } from "../extensions/FontFamilyClass";
import { FontSize } from "../extensions/FontSize";
import { Fullscreen } from "../extensions/Fullscreen";
import { GenericEmbed } from "../extensions/GenericEmbed";
import { ImagePasteDrop, IMAGE_DROP_ERROR_EVENT } from "../extensions/ImagePasteDrop";
import { ImageResize } from "../extensions/ImageResize";
import { Indent } from "../extensions/Indent";
import { KeyboardNavigation } from "../extensions/KeyboardNavigation";
import { ListItemMarkerFormat } from "../extensions/ListItemMarkerFormat";
import { OrderedListStyled } from "../extensions/OrderedListStyled";
import { TableBackgroundColor } from "../extensions/TableBackgroundColor";
import { TableCellBackgroundColor } from "../extensions/TableCellBackgroundColor";
import { TableHeaderBackgroundColor } from "../extensions/TableHeaderBackgroundColor";
import { TextAlign } from "../extensions/TextAlignClass";
import { TextColorClass } from "../extensions/TextColorClass";
import { TextDirection } from "../extensions/TextDirection";
import { TextHighlightClass } from "../extensions/TextHighlightClass";
import { WordPaste } from "../extensions/WordPaste";
import { YouTubeResize } from "../extensions/YouTubeResize";
import { TranslationProvider, useT } from "../utils/i18n";
import { ImageFileError } from "../utils/imageFiles";
import { ConfirmDialog } from "./toolbars/components/ConfirmDialog";
import { ToolbarGroupsConfig } from "./toolbars/ToolbarConfig";

/** How long a rejected drop/paste message stays on screen. */
const DROP_ERROR_TIMEOUT_MS = 5000;

export interface EditorProps extends Pick<
    RichTextContainerProps,
    | "styleDataFormat"
    | "imageSource"
    | "imageSourceContent"
    | "enableDefaultUpload"
    | "dialogStyle"
    | "preset"
    | "toolbarConfig"
    | "toolbarLocation"
    | "advancedConfig"
    | "customFonts"
    | "helpButton"
    | "onFocus"
    | "onBlur"
    | "onLoad"
    | "onChangeType"
    | "onChange"
> {
    defaultValue?: string;
    onUpdate?: (html: string) => void;
    readOnly?: boolean;
    className?: string;
    toolbarGroups?: ToolbarGroupsConfig;
    style?: CSSProperties;
}

export interface EditorHandle {
    getHTML: () => string;
    getText: () => string;
    focus: () => void;
    blur: () => void;
    getEditor: () => TipTapEditor | null;
}

interface EditorInnerProps extends Pick<
    RichTextContainerProps,
    "preset" | "toolbarConfig" | "advancedConfig" | "customFonts" | "helpButton"
> {
    showToolbar: boolean;
    readOnly: boolean;
    className?: string;
    toolbarGroups?: ToolbarGroupsConfig;
    style?: CSSProperties;
}

function EditorInner({
    showToolbar,
    readOnly,
    className,
    preset,
    toolbarConfig,
    toolbarGroups,
    advancedConfig,
    customFonts,
    helpButton,
    style
}: EditorInnerProps): ReactElement {
    const { editor, codeViewState, codeViewDispatch } = useCurrentEditor();
    const t = useT();
    // Rejected image drops/pastes are reported by the ImagePasteDrop plugin as a
    // DOM event (it runs outside React, where `useT` is unavailable) and are
    // translated and rendered here.
    const [dropError, setDropError] = useState<ImageFileError | null>(null);

    useEffect(() => {
        if (!editor) {
            return;
        }
        const dom = editor.view.dom;
        const handleDropError = (event: Event): void => {
            setDropError((event as CustomEvent<ImageFileError>).detail);
        };

        dom.addEventListener(IMAGE_DROP_ERROR_EVENT, handleDropError);
        return () => dom.removeEventListener(IMAGE_DROP_ERROR_EVENT, handleDropError);
    }, [editor]);

    useEffect(() => {
        if (!dropError) {
            return;
        }
        const timer = window.setTimeout(() => setDropError(null), DROP_ERROR_TIMEOUT_MS);
        return () => window.clearTimeout(timer);
    }, [dropError]);

    const handleSaveCode = (): void => {
        if (!editor) return;

        // Update editor content with modified HTML
        editor.commands.setContent(codeViewState.htmlCode);
        codeViewDispatch({ type: "SAVE_CODE_CHANGES", isExiting: true });
    };

    const handleCancelCode = (): void => {
        codeViewDispatch({ type: "CANCEL_CODE_CHANGES" });
    };

    const handleHtmlChange = (value: string): void => {
        codeViewDispatch({ type: "UPDATE_HTML_CODE", html: value });
    };

    return (
        <>
            <div className="tiptap-wrapper">
                {showToolbar && (
                    <Toolbar
                        preset={preset}
                        toolbarConfig={toolbarConfig}
                        toolbarGroups={toolbarGroups}
                        advancedConfig={advancedConfig}
                        customFonts={customFonts}
                        helpButton={helpButton}
                    ></Toolbar>
                )}
                {codeViewState.isCodeView ? (
                    <HighlightedCodeEditor
                        value={codeViewState.htmlCode}
                        onChange={handleHtmlChange}
                        readOnly={false}
                        style={{
                            height: style?.height,
                            minHeight: style?.minHeight,
                            maxHeight: style?.maxHeight,
                            overflowY: style?.overflowY
                        }}
                    />
                ) : (
                    <>
                        <EditorContent
                            editor={editor}
                            className={className}
                            style={{
                                height: style?.height,
                                minHeight: style?.minHeight,
                                maxHeight: style?.maxHeight,
                                overflowY: style?.overflowY
                            }}
                        />
                        {!readOnly && <LinkBubbleMenu />}
                    </>
                )}
                {dropError && (
                    <div className="rich-text-drop-error" role="status">
                        {dropError.arg ? t(dropError.key, dropError.arg) : t(dropError.key)}
                    </div>
                )}
            </div>
            {codeViewState.showConfirm && (
                <ConfirmDialog
                    message={t("codeEditor.confirmSave")}
                    confirmLabel={t("codeEditor.save")}
                    cancelLabel={t("codeEditor.cancel")}
                    onConfirm={handleSaveCode}
                    onCancel={handleCancelCode}
                />
            )}
        </>
    );
}

const Editor = forwardRef<EditorHandle, EditorProps>((props, ref) => {
    const {
        defaultValue,
        onUpdate,
        readOnly,
        className,
        styleDataFormat = "inline",
        toolbarLocation,
        imageSource,
        imageSourceContent,
        enableDefaultUpload,
        dialogStyle = "inline",
        ...others
    } = props;
    const actionRef = useMemo(
        () => ({
            current: {
                onChange: props.onChange,
                onChangeType: props.onChangeType,
                onFocus: props.onFocus,
                onBlur: props.onBlur,
                onLoad: props.onLoad
            }
        }),
        [props]
    );

    // Read by the ImagePasteDrop plugin at event time. Extension options are frozen
    // when the editor is created (`useEditor(..., [])`), and @tiptap/react
    // deliberately keeps the editor's current `editable` on re-render, so neither
    // `configure()` values nor `editor.isEditable` follow these props. A ref
    // reassigned on every render does.
    const configRef = useRef({ enableDefaultUpload, editable: !readOnly });
    configRef.current = { enableDefaultUpload, editable: !readOnly };

    const extensions = useMemo(
        () => [
            StarterKit.configure({
                // All three list nodes are replaced below so list markers can follow the
                // format of each item's first inline run.
                orderedList: false,
                bulletList: false,
                listItem: false,
                link: {
                    openOnClick: false,
                    HTMLAttributes: { class: "tiptap-link" }
                }
            }),
            OrderedListStyled.configure({
                styleDataFormat
            }),
            BulletListStyled.configure({
                styleDataFormat
            }),
            ListItemMarkerFormat.configure({
                styleDataFormat
            }),
            TextStyle,
            Superscript,
            Subscript,
            TaskList,
            TaskItem.configure({
                nested: true
            }),
            FontFamilyClass.configure({
                types: ["textStyle"],
                styleDataFormat
            }),
            FontSize.configure({
                types: ["textStyle"],
                styleDataFormat
            }),
            TextAlign.configure({
                types: ["heading", "paragraph"],
                alignments: ["left", "center", "right", "justify"],
                styleDataFormat
            }),
            Indent.configure({
                types: ["paragraph", "heading", "blockquote"],
                // Lists carry the indent attribute (so Ctrl+]/[ can margin them) but are
                // excluded from `types` so the toolbar/paragraph walk stays paragraph-only.
                attributeTypes: ["paragraph", "heading", "blockquote", "bulletList", "orderedList", "taskList"],
                minIndent: 0,
                maxIndent: 10,
                indentStep: 1,
                styleDataFormat
            }),
            KeyboardNavigation.configure({
                wrapperSelector: ".tiptap-wrapper",
                toolbarSelector: ".tiptap-toolbar",
                statusBarSelector: ".rich-text-status-bar",
                widgetSelector: ".widget-rich-text"
            }),
            TextDirection.configure({
                types: ["paragraph", "heading"],
                directions: ["ltr", "rtl"],
                defaultDirection: "ltr"
            }),
            Fullscreen.configure({
                widgetSelector: ".widget-rich-text",
                fullscreenClass: "fullscreen"
            }),
            TextColorClass.configure({ types: ["textStyle"], styleDataFormat }),
            TextHighlightClass.configure({ multicolor: true, styleDataFormat }),
            TableBackgroundColor.configure({ resizable: true, styleDataFormat }),
            TableRow,
            TableHeaderBackgroundColor.configure({ styleDataFormat }),
            TableCellBackgroundColor.configure({ styleDataFormat }),
            ImageResize.configure({
                inline: true,
                allowBase64: true,
                HTMLAttributes: {
                    class: "tiptap-image"
                }
            }),
            YouTubeResize.configure({
                inline: false,
                width: 640,
                height: 480,
                HTMLAttributes: {
                    class: "tiptap-video"
                }
            }),
            GenericEmbed.configure({
                inline: false,
                HTMLAttributes: {
                    class: "tiptap-embed"
                }
            }),
            WordPaste,
            ImagePasteDrop.configure({
                isEnabled: () => configRef.current.enableDefaultUpload,
                isEditable: () => configRef.current.editable,
                wrapperSelector: ".tiptap-wrapper",
                dragOverClass: "rich-text-drag-over"
            })
        ],
        [styleDataFormat]
    );

    const editor = useEditor(
        {
            extensions,
            enableCoreExtensions: {
                textDirection: false
            },
            content: defaultValue || "",
            editable: !readOnly,
            onUpdate: ({ editor }) => {
                const html = editor.isEmpty ? "" : editor.getHTML();
                onUpdate?.(html);
            },
            onFocus: () => {
                executeAction(actionRef.current.onFocus);
            },
            onBlur: () => {
                executeAction(actionRef.current.onBlur);
                if (actionRef.current.onChangeType === "onLeave") {
                    executeAction(actionRef.current.onChange);
                }
            },
            onCreate: () => {
                executeAction(actionRef.current.onLoad);
            },
            injectCSS: styleDataFormat === "inline"
        },
        []
    );

    useImperativeHandle(ref, () => ({
        getHTML: () => editor?.getHTML() || "",
        getText: () => editor?.getText() || "",
        focus: () => editor?.commands.focus(),
        blur: () => editor?.commands.blur(),
        getEditor: () => editor
    }));

    // update quills content on value change.
    useEffect(() => {
        if (!editor || editor.isFocused) {
            return;
        }
        // if there is an update comes from external element (default value sudden change)
        // only do update if editor not focused, otherwise it will override the user input.
        const newContent = editor.getHTML();
        if (newContent !== defaultValue) {
            // `emitUpdate: false`: this direction is external value -> editor, so echoing an
            // update back out would only write the editor's own serialization over a value
            // the user never touched. That rewrite is not harmless — it dirties the bound
            // attribute and fires the On change action on mere page load, for any stored
            // value that is not already byte-identical to `getHTML()`. Derived list marker
            // formatting makes that true of every previously saved formatted list.
            // A genuine edit still emits normally, through the `onUpdate` handler above.
            editor.commands.setContent(defaultValue || "", { emitUpdate: false });
        }
    }, [editor, defaultValue]);

    if (!editor) {
        return null;
    }

    const shouldHideToolbar = toolbarLocation === "hide";

    const imageConfig = {
        imageSourceContent,
        enableDefaultUpload,
        hasImageSource: imageSource != null
    };

    return (
        <TranslationProvider>
            <EditorContextProvider editor={editor} imageConfig={imageConfig} dialogStyle={dialogStyle}>
                <EditorInner showToolbar={!shouldHideToolbar} readOnly={!!readOnly} className={className} {...others} />
            </EditorContextProvider>
        </TranslationProvider>
    );
});

Editor.displayName = "Editor";

export default Editor;
