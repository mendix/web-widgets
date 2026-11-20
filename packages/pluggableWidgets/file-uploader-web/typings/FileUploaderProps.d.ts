/**
 * This file was generated from FileUploader.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ActionValue, DynamicValue, ListActionValue, ListValue } from "mendix";
import { ComponentType, CSSProperties, ReactNode } from "react";
import { Big } from "big.js";

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
    allowedFileFormats: AllowedFileFormatsType[];
    maxFilesPerUpload?: DynamicValue<Big>;
    maxFileSize: number;
    actions?: ReactNode;
    dropzoneIdleMessage: DynamicValue<string>;
    dropzoneAcceptedMessage: DynamicValue<string>;
    dropzoneRejectedMessage: DynamicValue<string>;
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
    uploadAction?: ActionValue;
    uploadItemAction?: ListActionValue;
    removeAction?: ListActionValue;
    removeActionTimeout: number;
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
    allowedFileFormats: AllowedFileFormatsPreviewType[];
    maxFilesPerUpload: string;
    maxFileSize: number | null;
    actions: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    dropzoneIdleMessage: string;
    dropzoneAcceptedMessage: string;
    dropzoneRejectedMessage: string;
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
    uploadAction: {} | null;
    uploadItemAction: {} | null;
    removeAction: {} | null;
    removeActionTimeout: number | null;
}
