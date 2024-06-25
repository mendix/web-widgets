import type { EditableValue, SimpleFormatter } from "mendix";
import classNames from "classnames";
import { createElement, ReactElement } from "react";
import { RichTextPreviewProps } from "../typings/RichTextProps";
import EditorWrapper from "./components/EditorWrapper";
import "./ui/RichText.scss";
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";

export enum FormatterType {
    Number = "number",
    DateTime = "datetime"
}

export function preview(props: RichTextPreviewProps): ReactElement {
    const stringAttribute = {
        value: "<p>Rich Text Editor</p>",
        displayValue: "",
        status: "available",
        validation: undefined,
        readOnly: false,
        formatter: {
            format: () => "",
            parse: () => {
                return { valid: true, value: "" };
            }
        } as SimpleFormatter<string>,
        setValidator: () => {},
        setValue: () => {},
        setTextValue: () => {},
        setFormatter: () => {}
    } as EditableValue<string>;

    return (
        <EditorWrapper
            name="RichText"
            id="RichText1"
            {...props}
            width={props.width ?? 0}
            height={props.height ?? 0}
            minHeight={props.minHeight ?? 0}
            onChange={{ canExecute: true, isExecuting: false, execute: () => {} }}
            onFocus={{ canExecute: true, isExecuting: false, execute: () => {} }}
            onBlur={{ canExecute: true, isExecuting: false, execute: () => {} }}
            stringAttribute={stringAttribute}
            className={classNames("widget-rich-text", "form-control")}
            toolbarOptions={[
                ["bold", "italic", "underline", "strike"], // toggled buttons
                ["blockquote", "code-block"],
                [{ list: "ordered" }, { list: "bullet" }],
                [{ script: "sub" }, { script: "super" }], // superscript/subscript
                [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
                [{ direction: "rtl" }], // text direction
                [{ color: [] }, { background: [] }], // dropdown with defaults from theme
                [{ font: [] }],
                [{ align: [] }],
                ["clean"] // remove formatting button
            ]}
        />
    );
}
