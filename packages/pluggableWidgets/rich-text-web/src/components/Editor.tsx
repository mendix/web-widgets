import { ReactElement, createElement, useCallback, useEffect, useRef, useState } from "react";

import { Editor } from "@tinymce/tinymce-react";
import type { EditorEvent, Editor as TinyMCEEditor } from "tinymce";

import "react-dom";
import "../utils/plugins";
import { RichTextContainerProps } from "typings/RichTextProps";
import { DEFAULT_CONFIG, API_KEY } from "../utils/constants";

type EditorState = "loading" | "ready";

interface BundledEditorProps extends RichTextContainerProps {
    toolbar: string | false;
    menubar: string | boolean;
    editorHeight?: string | number;
    editorWidth?: string | number;
}

export default function BundledEditor(props: BundledEditorProps): ReactElement {
    const {
        id,
        toolbar,
        stringAttribute,
        menubar,
        onBlur,
        onFocus,
        onChange,
        onChangeType,
        onKeyPress,
        toolbarMode,
        enableStatusBar,
        toolbarLocation,
        spellCheck,
        highlight_on_focus,
        resize,
        extended_valid_elements,
        quickbars,
        tabIndex
    } = props;
    const editorRef = useRef<TinyMCEEditor>();
    const editorValueRef = useRef<string>();
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
    }, [stringAttribute.value, stringAttribute.status, editorState]);

    const onEditorChange = useCallback(
        (value: string, _editor: TinyMCEEditor) => {
            setEditorValue(value);
            if (onChange?.canExecute && onChangeType === "onDataChange") {
                onChange.execute();
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [editorState]
    );

    const onEditorBlur = useCallback(
        (_event: EditorEvent<null>, editor: TinyMCEEditor) => {
            if (editorRef.current && stringAttribute?.status === "available" && editorState === "ready") {
                stringAttribute?.setValue(editorValue);

                if (onBlur?.canExecute) {
                    onBlur.execute();
                }
                if (
                    onChange?.canExecute &&
                    onChangeType === "onLeave" &&
                    editorValueRef.current !== editor.getContent()
                ) {
                    onChange.execute();
                }
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [stringAttribute, editorState, editorValue]
    );

    const onEditorFocus = useCallback(
        (_event: EditorEvent<null>, editor: TinyMCEEditor) => {
            if (onFocus?.canExecute) {
                onFocus.execute();
            }
            editorValueRef.current = editor.getContent();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [editorState]
    );

    const onEditorKeyPress = useCallback(
        (_event: EditorEvent<null>, _editor: TinyMCEEditor) => {
            if (onKeyPress?.canExecute) {
                onKeyPress.execute();
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
        return <div className="mx-progress"></div>;
    }

    return (
        <Editor
            id={`tinymceeditor_${id}`}
            onInit={(_evt, editor: TinyMCEEditor) => {
                editorRef.current = editor;
                setEditorState("ready");
            }}
            apiKey={API_KEY}
            value={editorValue}
            initialValue={stringAttribute.readOnly ? "" : stringAttribute.value}
            onEditorChange={onEditorChange}
            init={{
                ...DEFAULT_CONFIG,
                toolbar,
                menubar,
                content_style: [".widget-rich-text { font-family:Helvetica,Arial,sans-serif; font-size:14px }"].join(
                    "\n"
                ),
                toolbar_mode: toolbarMode,
                statusbar: enableStatusBar && !stringAttribute.readOnly,
                toolbar_location: _toolbarLocation,
                inline: toolbarLocation === "inline",
                browser_spellcheck: spellCheck,
                highlight_on_focus,
                resize: resize === "both" ? "both" : resize === "true",
                extended_valid_elements: extended_valid_elements?.value ?? "",
                quickbars_insert_toolbar: quickbars && !stringAttribute.readOnly,
                quickbars_selection_toolbar: quickbars && !stringAttribute.readOnly,
                height: props.editorHeight,
                width: props.editorWidth,
                contextmenu: props.contextmenutype === "richtext" ? "cut copy paste pastetext | link selectall" : false,
                content_css: props.content_css?.value,
                convert_unsafe_embeds: true,
                sandbox_iframes: true
            }}
            tabIndex={tabIndex || 0}
            disabled={stringAttribute.readOnly}
            onBlur={onEditorBlur}
            onFocus={onEditorFocus}
            onKeyPress={onEditorKeyPress}
        />
    );
}
