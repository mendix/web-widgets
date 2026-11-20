/**
 * This file was generated from FileUploader.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ActionValue, DynamicValue, ListActionValue, ListValue } from "mendix";
import { Big } from "big.js";
import { CSSProperties } from "react";

export type ConfigModeEnum = "simple" | "advanced";

export type PredefinedTypeEnum =
    | "pdfFile"
    | "msWordFile"
    | "msExcelFile"
    | "msPowerPointFile"
    | "plainTextFile"
    | "csvFile"
    | "zipArchiveFile"
    | "anyTextFile"
    | "anyImageFile"
    | "anyAudioFile"
    | "anyVideoFile";

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
    files: ListValue;
    uploadAction?: ActionValue;
    allowedFileFormats: AllowedFileFormatsType[];
    maxFilesPerUpload?: DynamicValue<Big>;
    maxFileSize: number;
    dropzoneIdleMessage: DynamicValue<string>;
    dropzoneAcceptedMessage: DynamicValue<string>;
    dropzoneRejectedMessage: DynamicValue<string>;
    uploadButtonCaptionMessage: DynamicValue<string>;
    uploadPendingMessage: DynamicValue<string>;
    uploadInProgressMessage: DynamicValue<string>;
    uploadSuccessMessage: DynamicValue<string>;
    uploadFailureGenericMessage: DynamicValue<string>;
    uploadFailureInvalidFileFormatMessage: DynamicValue<string>;
    uploadFailureFileIsTooBigMessage: DynamicValue<string>;
    uploadFailureTooManyFilesMessage: DynamicValue<string>;
    uploadLimitReachedMessage: DynamicValue<string>;
    unavailableCreateActionMessage: DynamicValue<string>;
    removeButtonTextMessage: DynamicValue<string>;
    uploadItemAction?: ListActionValue;
    removeAction?: ListActionValue;
    uploadActionTimeout: number;
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
    renderMode: "design" | "xray" | "structure";
    translate: (text: string) => string;
    files: {} | { caption: string } | { type: string } | null;
    uploadAction: {} | null;
    allowedFileFormats: AllowedFileFormatsPreviewType[];
    maxFilesPerUpload: string;
    maxFileSize: number | null;
    dropzoneIdleMessage: string;
    dropzoneAcceptedMessage: string;
    dropzoneRejectedMessage: string;
    uploadButtonCaptionMessage: string;
    uploadPendingMessage: string;
    uploadInProgressMessage: string;
    uploadSuccessMessage: string;
    uploadFailureGenericMessage: string;
    uploadFailureInvalidFileFormatMessage: string;
    uploadFailureFileIsTooBigMessage: string;
    uploadFailureTooManyFilesMessage: string;
    uploadLimitReachedMessage: string;
    unavailableCreateActionMessage: string;
    removeButtonTextMessage: string;
    uploadItemAction: {} | null;
    removeAction: {} | null;
    uploadActionTimeout: number | null;
}
