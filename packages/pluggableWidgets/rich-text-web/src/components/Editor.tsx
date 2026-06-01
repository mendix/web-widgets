import type { Editor as TipTapEditor } from "@tiptap/core";
// import { Color } from "@tiptap/extension-color";
// import { Highlight } from "@tiptap/extension-highlight";
// import { ListItem } from "@tiptap/extension-list-item";
import { Link } from "@tiptap/extension-link";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Underline } from "@tiptap/extension-underline";
import { Youtube } from "@tiptap/extension-youtube";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";

import { ChangeEvent, forwardRef, ReactElement, ReactNode, useImperativeHandle, useRef } from "react";
import { EditorContextProvider, useCurrentEditor } from "./EditorContext";
// import { DynamicTableStyles } from "./DynamicTableStyles";
// import { DynamicTextColorStyles } from "./DynamicTextColorStyles";
import { Toolbar } from "./toolbars";
import { FontFamilyClass } from "../extensions/FontFamilyClass";
import { FontSize } from "../extensions/FontSize";
import { ImageResize } from "../extensions/ImageResize";
import { Indent } from "../extensions/Indent";
import { TableBackgroundColor } from "../extensions/TableBackgroundColor";
import { TableCellBackgroundColor } from "../extensions/TableCellBackgroundColor";
import { TextColorClass } from "../extensions/TextColorClass";
import { TextDirection } from "../extensions/TextDirection";
import { TextHighlightClass } from "../extensions/TextHighlightClass";
import { ConfirmDialog } from "./toolbars/components/ConfirmDialog";
import { ToolbarGroupsConfig } from "./toolbars/ToolbarConfig";
import { PresetEnum, ToolbarConfigEnum, AdvancedConfigType } from "../../typings/RichTextProps";

export interface EditorProps {
    defaultValue?: string;
    onUpdate?: (html: string) => void;
    readOnly?: boolean;
    className?: string;
    showToolbar?: boolean;
    styleDataFormat?: "inline" | "class";
    imageSourceContent?: ReactNode;
    preset?: PresetEnum;
    toolbarConfig?: ToolbarConfigEnum;
    toolbarGroups?: ToolbarGroupsConfig;
    advancedConfig?: AdvancedConfigType[];
}

export interface EditorHandle {
    getHTML: () => string;
    getText: () => string;
    focus: () => void;
    blur: () => void;
    getEditor: () => TipTapEditor | null;
}

interface EditorInnerProps {
    showToolbar: boolean;
    readOnly: boolean;
    className?: string;
    imageSourceContent?: ReactNode;
    preset?: PresetEnum;
    toolbarConfig?: ToolbarConfigEnum;
    toolbarGroups?: ToolbarGroupsConfig;
    advancedConfig?: AdvancedConfigType[];
}

function EditorInner({
    showToolbar,
    readOnly,
    className,
    imageSourceContent,
    preset,
    toolbarConfig,
    toolbarGroups,
    advancedConfig
}: EditorInnerProps): ReactElement {
    const { editor, codeViewState, codeViewDispatch } = useCurrentEditor();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSaveCode = (): void => {
        if (!editor) return;

        // Update editor content with modified HTML
        editor.commands.setContent(codeViewState.htmlCode);
        codeViewDispatch({ type: "SAVE_CODE_CHANGES" });
    };

    const handleCancelCode = (): void => {
        codeViewDispatch({ type: "CANCEL_CODE_CHANGES" });
    };

    const handleHtmlChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
        codeViewDispatch({ type: "UPDATE_HTML_CODE", html: e.target.value });
    };

    return (
        <>
            <div className="tiptap-wrapper">
                {showToolbar && !readOnly && (
                    <Toolbar
                        imageSourceContent={imageSourceContent}
                        preset={preset}
                        toolbarConfig={toolbarConfig}
                        toolbarGroups={toolbarGroups}
                        advancedConfig={advancedConfig}
                    />
                )}
                {codeViewState.isCodeView ? (
                    <textarea
                        ref={textareaRef}
                        className="code-editor"
                        value={codeViewState.htmlCode}
                        onChange={handleHtmlChange}
                        spellCheck={false}
                    />
                ) : (
                    <EditorContent editor={editor} className={className} />
                )}
                {/* <DynamicTableStyles /> */}
                {/* {styleDataFormat === "class" && <DynamicTextColorStyles />} */}
            </div>
            {codeViewState.showConfirm && (
                <ConfirmDialog
                    title="Save Code Changes?"
                    message="Do you want to save the HTML code changes and apply them to the editor?"
                    confirmLabel="Save"
                    cancelLabel="Cancel"
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
        showToolbar = true,
        styleDataFormat = "inline",
        imageSourceContent,
        preset,
        toolbarConfig,
        toolbarGroups,
        advancedConfig
    } = props;

    const extensions = [
        StarterKit,
        TextStyle,
        Underline,
        Superscript,
        Subscript,
        TaskList,
        TaskItem.configure({
            nested: true
        }),
        Link.configure({
            openOnClick: false,
            HTMLAttributes: {
                class: "tiptap-link"
            }
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
            alignments: ["left", "center", "right", "justify"]
        }),
        Indent.configure({
            types: ["paragraph", "heading", "blockquote"],
            minIndent: 0,
            maxIndent: 10,
            indentStep: 1,
            styleDataFormat
        }),
        TextDirection.configure({
            types: ["paragraph", "heading"],
            directions: ["ltr", "rtl"],
            defaultDirection: "ltr"
        }),
        TextColorClass.configure({ types: ["textStyle"], styleDataFormat }),
        TextHighlightClass.configure({ multicolor: true, styleDataFormat }),
        TableBackgroundColor.configure({ resizable: true, styleDataFormat }),
        TableRow,
        TableHeader,
        TableCellBackgroundColor.configure({ styleDataFormat }),
        ImageResize.configure({
            inline: true,
            allowBase64: true,
            HTMLAttributes: {
                class: "tiptap-image"
            }
        }),
        Youtube.configure({
            inline: false,
            width: 640,
            height: 480,
            HTMLAttributes: {
                class: "tiptap-video"
            }
        })
    ];

    const editor = useEditor({
        extensions,
        content: defaultValue || "",
        editable: !readOnly,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onUpdate?.(html);
        }
    });

    useImperativeHandle(ref, () => ({
        getHTML: () => editor?.getHTML() || "",
        getText: () => editor?.getText() || "",
        focus: () => editor?.commands.focus(),
        blur: () => editor?.commands.blur(),
        getEditor: () => editor
    }));

    if (!editor) {
        return null;
    }

    return (
        <EditorContextProvider editor={editor}>
            <EditorInner
                showToolbar={showToolbar}
                readOnly={!!readOnly}
                className={className}
                imageSourceContent={imageSourceContent}
                preset={preset}
                toolbarConfig={toolbarConfig}
                toolbarGroups={toolbarGroups}
                advancedConfig={advancedConfig}
            />
        </EditorContextProvider>
    );
});

Editor.displayName = "Editor";

export default Editor;
