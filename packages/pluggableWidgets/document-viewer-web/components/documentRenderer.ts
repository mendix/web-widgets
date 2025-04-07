import { FC } from "react";
import { DocumentViewerContainerProps } from "../typings/DocumentViewerProps";

export interface DocRendererElement extends FC<DocumentViewerContainerProps> {
    contentTypes: string[];
}
