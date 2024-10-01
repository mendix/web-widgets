import type { EditableValue, SimpleFormatter } from "mendix";
import classNames from "classnames";
import { createElement, ReactElement } from "react";
import { RichTextPreviewProps } from "../typings/RichTextProps";
import EditorWrapper from "./components/EditorWrapper";
import "./ui/RichText.scss";
import "./ui/RichText.editor.scss";

export enum FormatterType {
    Number = "number",
    DateTime = "datetime"
}

function emptyFunction(): null {
    return null;
}
const emptyAction = { canExecute: true, isExecuting: false, execute: emptyFunction };

export function preview(props: RichTextPreviewProps): ReactElement {
    const stringAttribute = {
        value: `[${
            props.stringAttribute && props.stringAttribute !== "" ? props.stringAttribute : "No attribute selected"
        }]`,
        displayValue: "",
        status: "available",
        validation: undefined,
        readOnly: true,
        formatter: {
            format: () => "",
            parse: () => {
                return { valid: true, value: "" };
            }
        } as SimpleFormatter<string>,
        setValidator: emptyFunction,
        setValue: emptyFunction,
        setTextValue: emptyFunction,
        setFormatter: emptyFunction,
        isList: false
    } as EditableValue<string>;

    return (
        <EditorWrapper
            name="RichText"
            id="RichText1"
            {...props}
            width={props.width ?? 0}
            height={props.height ?? 0}
            minHeight={props.minHeight ?? 0}
            onChange={emptyAction}
            onFocus={emptyAction}
            onBlur={emptyAction}
            onLoad={emptyAction}
            stringAttribute={stringAttribute}
            className={classNames("widget-rich-text", "form-control")}
            readOnlyStyle={props.readOnly ? props.readOnlyStyle : "text"}
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
