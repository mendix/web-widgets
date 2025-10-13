/**
 * This file was generated from BarcodeGenerator.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { EditableValue } from "mendix";

export type CodeFormatEnum = "QR" | "CODE128" | "CODE39" | "CODE93" | "EAN8" | "EAN13" | "UPC" | "UPCE" | "ITF" | "ITF14" | "MSI" | "Pharmacode" | "CODABAR" | "DataMatrix" | "PDF417" | "AZTEC";

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
}
