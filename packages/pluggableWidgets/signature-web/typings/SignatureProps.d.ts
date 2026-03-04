/**
 * This file was generated from Signature.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { EditableValue, EditableImageValue, WebImage } from "mendix";

export type PenTypeEnum = "fountain" | "ballpoint" | "marker";

export type WidthUnitEnum = "percentage" | "pixels";

export type HeightUnitEnum = "percentageOfWidth" | "pixels" | "percentageOfParent";

export interface SignatureContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    imageSource: EditableImageValue<WebImage>;
    hasSignatureAttribute?: EditableValue<boolean>;
    penType: PenTypeEnum;
    penColor: string;
    widthUnit: WidthUnitEnum;
    width: number;
    heightUnit: HeightUnitEnum;
    height: number;
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
    hasSignatureAttribute: string;
    penType: PenTypeEnum;
    penColor: string;
    widthUnit: WidthUnitEnum;
    width: number | null;
    heightUnit: HeightUnitEnum;
    height: number | null;
    showGrid: boolean;
    gridBorderColor: string;
    gridCellHeight: number | null;
    gridCellWidth: number | null;
    gridBorderWidth: number | null;
}
