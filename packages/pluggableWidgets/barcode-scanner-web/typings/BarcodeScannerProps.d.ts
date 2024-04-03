/**
 * This file was generated from BarcodeScanner.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, EditableValue } from "mendix";

export type BarcodeFormatEnum = "AZTEC" | "CODE_39" | "CODE_128" | "DATA_MATRIX" | "EAN_8" | "EAN_13" | "ITF" | "PDF_417" | "QR_CODE" | "RSS_14" | "UPC_A" | "UPC_E";

export interface BarcodeFormatsType {
    barcodeFormat: BarcodeFormatEnum;
}

export type WidthUnitEnum = "percentage" | "pixels";

export type HeightUnitEnum = "percentageOfWidth" | "pixels" | "percentageOfParent";

export interface BarcodeFormatsPreviewType {
    barcodeFormat: BarcodeFormatEnum;
}

export interface BarcodeScannerContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    datasource: EditableValue<string>;
    showMask: boolean;
    useAllFormats: boolean;
    barcodeFormats: BarcodeFormatsType[];
    onDetect?: ActionValue;
    widthUnit: WidthUnitEnum;
    width: number;
    heightUnit: HeightUnitEnum;
    height: number;
}

export interface BarcodeScannerPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    datasource: string;
    showMask: boolean;
    useAllFormats: boolean;
    barcodeFormats: BarcodeFormatsPreviewType[];
    onDetect: {} | null;
    widthUnit: WidthUnitEnum;
    width: number | null;
    heightUnit: HeightUnitEnum;
    height: number | null;
}
