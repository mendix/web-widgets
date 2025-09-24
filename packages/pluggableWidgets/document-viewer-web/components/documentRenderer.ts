import { FC } from "react";
import { DocumentViewerContainerProps } from "../typings/DocumentViewerProps";

export declare const enum DocumentStatus {
    available = "available",
    error = "error",
    loading = "loading"
}

export interface DocumentStatusEvent {
    status: DocumentStatus;
    message?: string;
}

export interface DocumentRendererProps extends DocumentViewerContainerProps {
    setDocumentStatus: (status: DocumentStatusEvent) => void;
    documentStatus: DocumentStatusEvent;
}

export interface DocRendererElement extends FC<DocumentRendererProps> {
    contentTypes: string[];
    fileTypes: string[];
}
