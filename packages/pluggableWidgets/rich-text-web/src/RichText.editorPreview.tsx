import { ReactElement, createElement } from "react";
import { RichTextPreviewProps } from "../typings/RichTextProps";

export function preview(_props: RichTextPreviewProps): ReactElement {
    return createElement("div", { className: "widget-rich-text-preview" }, "Rich Text Editor");
}

export function getPreviewCss(): string {
    return require("./ui/RichText.scss");
}
