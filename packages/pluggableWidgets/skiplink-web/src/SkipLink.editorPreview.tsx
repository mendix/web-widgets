import { ReactElement } from "react";
import { SkipLinkPreviewProps } from "../typings/SkipLinkProps";

export const preview = (props: SkipLinkPreviewProps): ReactElement => {
    if (props.renderMode === "xray") {
        return (
            <div style={{ position: "relative", height: 40 }}>
                <a href={`#${props.mainContentId}`} style={props.styleObject}>
                    {props.linkText}
                </a>
            </div>
        );
    } else {
        return (
            <a href={`#${props.mainContentId}`} style={props.styleObject}>
                {props.linkText}
            </a>
        );
    }
};

export function getPreviewCss(): string {
    return require("./ui/SkipLink.scss");
}
