// import { parseStyle } from "@mendix/widget-plugin-platform/preview/parse-style";
import { createElement, ReactElement } from "react";

import { MarkdownPreviewProps } from "../typings/MarkdownProps";
import { Markdown } from "./Markdown";

export const preview = (props: MarkdownPreviewProps): ReactElement => {
    // TODO: Change PIW preview props typing (class -> className) generation to remove the ts-ignore below
    // @ts-ignore
    // const { className, style, type, value } = props;
    return <Markdown {...props}></Markdown>;
    // return <Markdown type={type} value={value ? value : ""} className={className} style={parseStyle(style)} />;
};
