/**
 * This file was generated from FileUploader.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, DynamicValue, ListValue } from "mendix";

export type UploadModeEnum = "files" | "images";

export type ConfigModeEnum = "simple" | "advanced";

export type PredefinedTypeEnum = "pdfFile" | "msWordFile" | "msExcelFile" | "msPowerPointFile" | "plainTextFile" | "csvFile" | "zipArchiveFile" | "anyTextFile" | "anyImageFile" | "anyAudioFile" | "anyVideoFile";

export interface AllowedFileFormatsType {
    configMode: ConfigModeEnum;
    predefinedType: PredefinedTypeEnum;
    mimeType: string;
    extensions: string;
    typeFormatDescription: DynamicValue<string>;
}

export interface AllowedFileFormatsPreviewType {
    configMode: ConfigModeEnum;
    predefinedType: PredefinedTypeEnum;
    mimeType: string;
    extensions: string;
    typeFormatDescription: string;
}

export interface FileUploaderContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    uploadMode: UploadModeEnum;
    associatedFiles: ListValue;
    associatedImages: ListValue;
    readOnlyMode: boolean;
    createFileAction?: ActionValue;
    createImageAction?: ActionValue;
    allowedFileFormats: AllowedFileFormatsType[];
    maxFilesPerUpload: number;
    maxFileSize: number;
    dropzoneIdleMessage: DynamicValue<string>;
    dropzoneAcceptedMessage: DynamicValue<string>;
    dropzoneRejectedMessage: DynamicValue<string>;
    uploadInProgressMessage: DynamicValue<string>;
    uploadSuccessMessage: DynamicValue<string>;
    uploadFailureGenericMessage: DynamicValue<string>;
    uploadFailureInvalidFileFormatMessage: DynamicValue<string>;
    uploadFailureFileIsTooBigMessage: DynamicValue<string>;
    uploadFailureTooManyFilesMessage: DynamicValue<string>;
    unavailableCreateActionMessage: DynamicValue<string>;
    downloadButtonTextMessage: DynamicValue<string>;
    removeButtonTextMessage: DynamicValue<string>;
    removeSuccessMessage: DynamicValue<string>;
    removeErrorMessage: DynamicValue<string>;
    objectCreationTimeout: number;
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
    renderMode?: "design" | "xray" | "structure";
    uploadMode: UploadModeEnum;
    associatedFiles: {} | { caption: string } | { type: string } | null;
    associatedImages: {} | { caption: string } | { type: string } | null;
    readOnlyMode: boolean;
    createFileAction: {} | null;
    createImageAction: {} | null;
    allowedFileFormats: AllowedFileFormatsPreviewType[];
    maxFilesPerUpload: number | null;
    maxFileSize: number | null;
    dropzoneIdleMessage: string;
    dropzoneAcceptedMessage: string;
    dropzoneRejectedMessage: string;
    uploadInProgressMessage: string;
    uploadSuccessMessage: string;
    uploadFailureGenericMessage: string;
    uploadFailureInvalidFileFormatMessage: string;
    uploadFailureFileIsTooBigMessage: string;
    uploadFailureTooManyFilesMessage: string;
    unavailableCreateActionMessage: string;
    downloadButtonTextMessage: string;
    removeButtonTextMessage: string;
    removeSuccessMessage: string;
    removeErrorMessage: string;
    objectCreationTimeout: number | null;
}
