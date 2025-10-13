/**
 * This file was generated from QRCodeGenerator.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { EditableValue } from "mendix";

export type CodeFormatEnum = "CODE128" | "QR";

export interface QRCodeGeneratorContainerProps {
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

export interface QRCodeGeneratorPreviewProps {
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
