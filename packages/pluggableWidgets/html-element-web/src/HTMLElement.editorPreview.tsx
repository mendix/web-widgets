import { ReactElement, createElement } from "react";
import { HTMLElementPreviewProps } from "../typings/HTMLElementProps";

export function preview(props: HTMLElementPreviewProps): ReactElement {
    return <div className={props.className}>HTML Element</div>;
}

export function getPreviewCss(): string {
    // html element has no styling by design
    return "";
}
