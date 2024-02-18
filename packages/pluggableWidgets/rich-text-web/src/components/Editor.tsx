import { createElement, useEffect, useRef, useState, ReactElement, useCallback } from "react";

import { Editor } from "@tinymce/tinymce-react";
import { Editor as TinyMCEEditor } from "tinymce";

import "react-dom";
import "tinymce/tinymce";

import "tinymce/models/dom/model";

import "tinymce/themes/silver";

import "tinymce/icons/default";

import "tinymce/plugins/advlist";
import "tinymce/plugins/anchor";
import "tinymce/plugins/autolink";
import "tinymce/plugins/autoresize";
import "tinymce/plugins/autosave";
import "tinymce/plugins/charmap";
import "tinymce/plugins/code";
import "tinymce/plugins/codesample";
import "tinymce/plugins/directionality";
import "tinymce/plugins/emoticons";
import "tinymce/plugins/fullscreen";
import "tinymce/plugins/help";
import "tinymce/plugins/help/js/i18n/keynav/en";
import "tinymce/plugins/image";
import "tinymce/plugins/importcss";
import "tinymce/plugins/insertdatetime";
import "tinymce/plugins/link";
import "tinymce/plugins/lists";
import "tinymce/plugins/media";
import "tinymce/plugins/nonbreaking";
import "tinymce/plugins/pagebreak";
import "tinymce/plugins/preview";
import "tinymce/plugins/quickbars";
import "tinymce/plugins/save";
import "tinymce/plugins/searchreplace";
import "tinymce/plugins/table";
import "tinymce/plugins/template";
import "tinymce/plugins/visualblocks";
import "tinymce/plugins/visualchars";
import "tinymce/plugins/wordcount";
import "tinymce/plugins/emoticons/js/emojis";

import contentCss from "tinymce/skins/content/default/content.min.css";
import { RichTextContainerProps } from "typings/RichTextProps";

type EditorState = "loading" | "ready";

export default function BundledEditor(props: RichTextContainerProps): ReactElement {
    const { plugins, toolbar, stringAttribute, enableMenuBar, menubar } = props;
    const editorRef = useRef<TinyMCEEditor>();
    const [editorState, setEditorState] = useState<EditorState>("loading");
    const [editorValue, setEditorValue] = useState(stringAttribute.value ?? "");

    useEffect(() => {
        if (stringAttribute?.status === "available" && editorState === "ready") {
            setEditorValue(stringAttribute.value ?? "");
        }
    }, [stringAttribute, editorState]);
    const onEditorChange = useCallback(
        (value: string, _editor: TinyMCEEditor) => {
            setEditorValue(value);
        },
        [editorState]
    );

    const onEditorBlur = useCallback(() => {
        if (editorRef.current && stringAttribute?.status === "available" && editorState === "ready") {
            stringAttribute?.setValue(editorValue);
        }
    }, [stringAttribute, editorState, editorValue]);

    return (
        <Editor
            onInit={(_evt, editor: TinyMCEEditor) => {
                editorRef.current = editor;
                setEditorState("ready");
            }}
            value={editorValue}
            initialValue=""
            onEditorChange={onEditorChange}
            init={{
                plugins,
                toolbar,
                menubar: enableMenuBar ? menubar : false,
                width: "100%",
                skin: false,
                content_css: false,
                content_style: [contentCss, "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }"].join(
                    "\n"
                ),
                promotion: false,
                branding: false,
                base_url: "widgets/com/mendix/widget/custom/richtext"
            }}
            onBlur={onEditorBlur}
        />
    );
}
