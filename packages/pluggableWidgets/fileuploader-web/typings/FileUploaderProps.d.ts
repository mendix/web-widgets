/**
 * This file was generated from FileUploader.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, ListValue } from "mendix";

export interface AllowedFileFormatsType {
    mimeType: string;
    extensions: string;
}

export interface AllowedFileFormatsPreviewType {
    mimeType: string;
    extensions: string;
}

export interface FileUploaderContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    associatedFiles: ListValue;
    createFileAction?: ActionValue;
    allowedFileFormats: AllowedFileFormatsType[];
    maxFilesPerUpload: number;
    maxFileSize: number;
}

export interface FileUploaderPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    associatedFiles: {} | { caption: string } | { type: string } | null;
    createFileAction: {} | null;
    allowedFileFormats: AllowedFileFormatsPreviewType[];
    maxFilesPerUpload: number | null;
    maxFileSize: number | null;
}
