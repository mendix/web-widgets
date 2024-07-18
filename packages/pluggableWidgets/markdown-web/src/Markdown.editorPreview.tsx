import { createElement, ReactElement } from "react";
import { MarkdownPreviewProps } from "../typings/MarkdownProps";
import "./ui/Markdown.scss";

export const preview = (props: MarkdownPreviewProps): ReactElement => {
    const { stringAttribute } = props;
    return (
        <div className="widget-markdown preview">
            <div className="widget-markdown-content">
                {stringAttribute ? `[${stringAttribute}]` : "[No attribute selected]"}
            </div>
        </div>
    );
};
