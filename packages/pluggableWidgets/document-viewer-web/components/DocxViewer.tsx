import { createElement, Fragment } from "react";
import { DocumentViewerContainerProps } from "../typings/DocumentViewerProps";
import { DocRendererElement } from "./documentRenderer";

const DocxViewer: DocRendererElement = (_props: DocumentViewerContainerProps) => {
    return <Fragment>DOCX</Fragment>;
};

DocxViewer.contentTypes = [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "application/vnd.ms-word",
    "application/vnd.ms-word.document.macroEnabled.12",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.template",
    "application/vnd.ms-word.template.macroEnabled.12",
    "application/vnd.ms-word.document.12",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/octet-stream"
];

export default DocxViewer;
