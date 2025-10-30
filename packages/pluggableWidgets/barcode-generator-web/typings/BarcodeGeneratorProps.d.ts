/**
 * This file was generated from BarcodeGenerator.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { EditableValue } from "mendix";

export type CodeFormatEnum = "CODE128" | "QRCode" | "Custom";

export type CustomCodeFormatEnum = "CODE128" | "EAN13" | "EAN8" | "EAN5" | "EAN2" | "UPC" | "CODE39" | "ITF14" | "MSI" | "pharmacode" | "codabar" | "CODE93";

export interface BarcodeGeneratorContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    codeValue: EditableValue<string>;
    codeFormat: CodeFormatEnum;
    displayValue: boolean;
    codeWidth: number;
    codeHeight: number;
    qrSize: number;
    codeMargin: number;
    customCodeFormat: CustomCodeFormatEnum;
}

export interface BarcodeGeneratorPreviewProps {
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
    codeValue: string;
    codeFormat: CodeFormatEnum;
    displayValue: boolean;
    codeWidth: number | null;
    codeHeight: number | null;
    qrSize: number | null;
    codeMargin: number | null;
    customCodeFormat: CustomCodeFormatEnum;
}
