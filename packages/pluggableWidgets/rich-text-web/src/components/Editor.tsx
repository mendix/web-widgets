import type { Editor as TipTapEditor } from "@tiptap/core";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { TableRow } from "@tiptap/extension-table-row";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import { TextStyle } from "@tiptap/extension-text-style";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { CSSProperties, forwardRef, ReactElement, useEffect, useImperativeHandle, useMemo } from "react";
import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import { EditorContextProvider, useCurrentEditor } from "./EditorContext";
import { HighlightedCodeEditor } from "./HighlightedCodeEditor";
import { LinkBubbleMenu } from "./LinkBubbleMenu";
import { Toolbar } from "./toolbars";
import { RichTextContainerProps } from "../../typings/RichTextProps";
import { FontFamilyClass } from "../extensions/FontFamilyClass";
import { FontSize } from "../extensions/FontSize";
import { Fullscreen } from "../extensions/Fullscreen";
import { GenericEmbed } from "../extensions/GenericEmbed";
import { ImageResize } from "../extensions/ImageResize";
import { Indent } from "../extensions/Indent";
import { KeyboardNavigation } from "../extensions/KeyboardNavigation";
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
import { ConfirmDialog } from "./toolbars/components/ConfirmDialog";
import { ToolbarGroupsConfig } from "./toolbars/ToolbarConfig";

export interface EditorProps extends Pick<
    RichTextContainerProps,
    | "styleDataFormat"
    | "imageSource"
    | "imageSourceContent"
    | "enableDefaultUpload"
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

    const extensions = useMemo(
        () => [
            StarterKit.configure({
                orderedList: false,
                link: {
                    openOnClick: false,
                    HTMLAttributes: { class: "tiptap-link" }
                }
            }),
            OrderedListStyled.configure({
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
            WordPaste
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
            editor.commands.setContent(defaultValue || "");
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
            <EditorContextProvider editor={editor} imageConfig={imageConfig}>
                <EditorInner showToolbar={!shouldHideToolbar} readOnly={!!readOnly} className={className} {...others} />
            </EditorContextProvider>
        </TranslationProvider>
    );
});

Editor.displayName = "Editor";

export default Editor;
