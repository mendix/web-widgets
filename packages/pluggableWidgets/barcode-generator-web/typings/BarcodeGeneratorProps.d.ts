/**
 * This file was generated from BarcodeGenerator.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { DynamicValue, EditableValue, WebImage } from "mendix";
import { Big } from "big.js";

export type CodeFormatEnum = "CODE128" | "QRCode" | "Custom";

export type ButtonPositionEnum = "top" | "bottom";

export type CustomCodeFormatEnum = "CODE128" | "EAN13" | "EAN8" | "UPC" | "CODE39" | "ITF14" | "MSI" | "pharmacode" | "codabar" | "CODE93";

export type AddonFormatEnum = "None" | "EAN5" | "EAN2";

export type QrLevelEnum = "L" | "M" | "Q" | "H";

export interface BarcodeGeneratorContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    codeValue: DynamicValue<string>;
    codeFormat: CodeFormatEnum;
    allowDownload: boolean;
    downloadButtonCaption?: DynamicValue<string>;
    downloadButtonAriaLabel?: DynamicValue<string>;
    buttonPosition: ButtonPositionEnum;
    customCodeFormat: CustomCodeFormatEnum;
    enableEan128: boolean;
    enableFlat: boolean;
    lastChar: string;
    enableMod43: boolean;
    addonFormat: AddonFormatEnum;
    addonValue: EditableValue<string>;
    addonSpacing: number;
    displayValue: boolean;
    showAsCard: boolean;
    codeWidth: number;
    codeHeight: number;
    codeMargin: number;
    qrSize: number;
    qrMargin: number;
    qrTitle: string;
    qrLevel: QrLevelEnum;
    qrImage: boolean;
    qrImageSrc: DynamicValue<WebImage>;
    qrImageCenter: boolean;
    qrImageX: number;
    qrImageY: number;
    qrImageHeight: number;
    qrImageWidth: number;
    qrImageOpacity: Big;
    qrImageExcavate: boolean;
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
    allowDownload: boolean;
    downloadButtonCaption: string;
    downloadButtonAriaLabel: string;
    buttonPosition: ButtonPositionEnum;
    customCodeFormat: CustomCodeFormatEnum;
    enableEan128: boolean;
    enableFlat: boolean;
    lastChar: string;
    enableMod43: boolean;
    addonFormat: AddonFormatEnum;
    addonValue: string;
    addonSpacing: number | null;
    displayValue: boolean;
    showAsCard: boolean;
    codeWidth: number | null;
    codeHeight: number | null;
    codeMargin: number | null;
    qrSize: number | null;
    qrMargin: number | null;
    qrTitle: string;
    qrLevel: QrLevelEnum;
    qrImage: boolean;
    qrImageSrc: { type: "static"; imageUrl: string; } | { type: "dynamic"; entity: string; } | null;
    qrImageCenter: boolean;
    qrImageX: number | null;
    qrImageY: number | null;
    qrImageHeight: number | null;
    qrImageWidth: number | null;
    qrImageOpacity: number | null;
    qrImageExcavate: boolean;
}
