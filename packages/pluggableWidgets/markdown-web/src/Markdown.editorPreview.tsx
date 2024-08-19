import { createElement, ReactElement } from "react";
import { MarkdownPreviewProps } from "../typings/MarkdownProps";
import "./ui/Markdown.scss";

export const preview = (props: MarkdownPreviewProps): ReactElement => {
    const { stringAttribute } = props;
    return (
        <div className="widget-markdown preview">
            <p>{stringAttribute ? `[${stringAttribute}]` : "[No attribute selected]"}</p>
        </div>
    );
};
