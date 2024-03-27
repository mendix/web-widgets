import { ReactElement, createElement, useCallback, useEffect, useRef, useState } from "react";

import { Editor } from "@tinymce/tinymce-react";
import { EditorEvent, Editor as TinyMCEEditor } from "tinymce";

import "react-dom";
import "tinymce/tinymce";

import "tinymce/models/dom/model";

import "tinymce/themes/silver";

import "tinymce/icons/default";

import "tinymce/plugins/accordion";
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
import "tinymce/plugins/emoticons/js/emojis";
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
import "tinymce/plugins/visualblocks";
import "tinymce/plugins/visualchars";
import "tinymce/plugins/wordcount";

import contentCss from "tinymce/skins/content/default/content.min.css";
import { RichTextContainerProps } from "typings/RichTextProps";
import { DEFAULT_CONFIG } from "../utils/contants";

type EditorState = "loading" | "ready";

interface BundledEditorProps extends RichTextContainerProps {
    toolbar: string | false;
    menubar: string | boolean;
}

export default function BundledEditor(props: BundledEditorProps): ReactElement {
    const {
        id,
        toolbar,
        stringAttribute,
        menubar,
        onBlur,
        onFocus,
        toolbarMode,
        enableStatusBar,
        toolbarLocation,
        spellCheck,
        highlight_on_focus,
        resize,
        extended_valid_elements
    } = props;
    const editorRef = useRef<TinyMCEEditor>();
    const [canRenderEditor, setCanRenderEditor] = useState<boolean>(false);
    const [editorState, setEditorState] = useState<EditorState>("loading");
    const [editorValue, setEditorValue] = useState(stringAttribute.value ?? "");

    const _toolbarLocation = toolbarLocation === "inline" ? "auto" : toolbarLocation;

    useEffect(() => {
        setTimeout(() => {
            setCanRenderEditor(true);
        }, 100);
    }, []);
    useEffect(() => {
        if (stringAttribute?.status === "available" && editorState === "ready") {
            setEditorValue(stringAttribute.value ?? "");
        }
    }, [stringAttribute, editorState]);

    const onEditorChange = useCallback(
        (value: string, _editor: TinyMCEEditor) => {
            setEditorValue(value);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [editorState]
    );

    const onEditorBlur = useCallback(() => {
        if (editorRef.current && stringAttribute?.status === "available" && editorState === "ready") {
            stringAttribute?.setValue(editorValue);
        }

        if (onBlur?.canExecute) {
            onBlur.execute();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stringAttribute, editorState, editorValue]);

    const onEditorFocus = useCallback(
        (_event: EditorEvent<null>, _editor: TinyMCEEditor) => {
            if (onFocus?.canExecute) {
                onFocus.execute();
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [editorState]
    );
    if (!canRenderEditor) {
        // this is to make sure that tinymce.init is ready to be triggered on the page
        // react page needs "mx-progress" a couple of milisecond to be rendered
        // use the next tick to trigger tinymce.init for consistent result
        // especially if we have multiple editor in single page
        return <div></div>;
    }

    return (
        <Editor
            id={`tinymceeditor_${id}`}
            onInit={(_evt, editor: TinyMCEEditor) => {
                editorRef.current = editor;
                setEditorState("ready");
            }}
            value={editorValue}
            initialValue={stringAttribute.readOnly ? "" : stringAttribute.value}
            onEditorChange={onEditorChange}
            init={{
                ...DEFAULT_CONFIG,
                toolbar,
                menubar,
                content_style: [contentCss, "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }"].join(
                    "\n"
                ),
                toolbar_mode: toolbarMode,
                statusbar: enableStatusBar && !stringAttribute.readOnly,
                toolbar_location: _toolbarLocation,
                inline: toolbarLocation === "inline",
                browser_spellcheck: spellCheck,
                highlight_on_focus,
                resize: resize === "both" ? "both" : resize === "true",
                extended_valid_elements: extended_valid_elements?.value ?? ""
            }}
            disabled={stringAttribute.readOnly}
            onBlur={onEditorBlur}
            onFocus={onEditorFocus}
        />
    );
}
