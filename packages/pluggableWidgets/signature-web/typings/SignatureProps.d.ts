/**
 * This file was generated from Signature.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, DynamicValue, EditableValue, EditableImageValue, Option, WebImage } from "mendix";

export type PenTypeEnum = "fountain" | "ballpoint" | "marker";

export type WidthUnitEnum = "pixels" | "percentage";

export type HeightUnitEnum = "auto" | "pixels" | "percentageOfParent" | "percentageOfView";

export type MinHeightUnitEnum = "none" | "pixels" | "percentageOfParent" | "percentageOfView";

export type MaxHeightUnitEnum = "none" | "pixels" | "percentageOfParent" | "percentageOfView";

export type OverflowYEnum = "auto" | "scroll" | "hidden";

export interface SignatureContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    imageSource: EditableImageValue<WebImage>;
    fileName?: DynamicValue<string>;
    hasSignatureAttribute?: EditableValue<boolean>;
    penType: PenTypeEnum;
    penColor: string;
    widthUnit: WidthUnitEnum;
    width: number;
    heightUnit: HeightUnitEnum;
    height: number;
    minHeightUnit: MinHeightUnitEnum;
    minHeight: number;
    maxHeightUnit: MaxHeightUnitEnum;
    maxHeight: number;
    overflowY: OverflowYEnum;
    onSignEndAction?: ActionValue<{ signatureImage: Option<string> }>;
    showGrid: boolean;
    gridBorderColor: string;
    gridCellHeight: number;
    gridCellWidth: number;
    gridBorderWidth: number;
}

export interface SignaturePreviewProps {
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
    imageSource: { type: "static"; imageUrl: string; } | { type: "dynamic"; entity: string; } | null;
    fileName: string;
    hasSignatureAttribute: string;
    penType: PenTypeEnum;
    penColor: string;
    widthUnit: WidthUnitEnum;
    width: number | null;
    heightUnit: HeightUnitEnum;
    height: number | null;
    minHeightUnit: MinHeightUnitEnum;
    minHeight: number | null;
    maxHeightUnit: MaxHeightUnitEnum;
    maxHeight: number | null;
    overflowY: OverflowYEnum;
    onSignEndAction: {} | null;
    showGrid: boolean;
    gridBorderColor: string;
    gridCellHeight: number | null;
    gridCellWidth: number | null;
    gridBorderWidth: number | null;
}
