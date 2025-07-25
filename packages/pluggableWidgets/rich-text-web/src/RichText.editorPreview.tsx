import { createElement, ReactElement } from "react";
import RichTextPreviewSVG from "./assets/rich-text-preview-light.svg";
import { RichTextPreviewProps } from "../typings/RichTextProps";

export function preview(props: RichTextPreviewProps): ReactElement {
    let doc = decodeURI(RichTextPreviewSVG);
    doc = props.stringAttribute ? doc.replace("[No attribute selected]", `[${props.stringAttribute}]`) : doc;

    return (
        <div className="widget-rich-text">
            <img src={doc} alt="" />
            {props.imageSource && (
                <props.imageSourceContent.renderer caption="Place image selection widget here">
                    <div />
                </props.imageSourceContent.renderer>
            )}
        </div>
    );
}
