// import { parseStyle } from "@mendix/widget-plugin-platform/preview/parse-style";
import { createElement, ReactElement } from "react";

import { DocumentViewerPreviewProps } from "../typings/DocumentViewerProps";
import { DocumentViewer } from "./DocumentViewer";

export const preview = (props: DocumentViewerPreviewProps): ReactElement => {
    // TODO: Change PIW preview props typing (class -> className) generation to remove the ts-ignore below
    // @ts-ignore
    // const { className, style, type, value } = props;
    return <DocumentViewer {...props}></DocumentViewer>;
};
