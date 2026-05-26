/**
 * This file was generated from ImageCrop.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, DynamicValue, EditableImageValue, WebImage } from "mendix";
import { Big } from "big.js";

export type CropShapeEnum = "rect" | "circle";

export type AspectRatioEnum = "free" | "square" | "landscape16x9" | "landscape4x3" | "portrait3x4" | "custom";

export type WheelZoomModeEnum = "off" | "on" | "onWithCtrl";

export type OutputFormatEnum = "png" | "jpeg";

export type OutputSizeEnum = "viewport" | "original";

export interface ImageCropContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    image: EditableImageValue<WebImage>;
    cropShape: CropShapeEnum;
    aspectRatio: AspectRatioEnum;
    customAspectWidth: number;
    customAspectHeight: number;
    boundaryWidth: number;
    boundaryHeight: number;
    resizableEnabled: boolean;
    zoomEnabled: boolean;
    wheelZoomMode: WheelZoomModeEnum;
    minZoom: Big;
    maxZoom: Big;
    showPreview: boolean;
    previewWidth: number;
    previewHeight: number;
    outputFormat: OutputFormatEnum;
    outputQuality: Big;
    outputSize: OutputSizeEnum;
    cropButtonCaption?: DynamicValue<string>;
    onCropAction?: ActionValue;
}

export interface ImageCropPreviewProps {
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
    image: { type: "static"; imageUrl: string; } | { type: "dynamic"; entity: string; } | null;
    cropShape: CropShapeEnum;
    aspectRatio: AspectRatioEnum;
    customAspectWidth: number | null;
    customAspectHeight: number | null;
    boundaryWidth: number | null;
    boundaryHeight: number | null;
    resizableEnabled: boolean;
    zoomEnabled: boolean;
    wheelZoomMode: WheelZoomModeEnum;
    minZoom: number | null;
    maxZoom: number | null;
    showPreview: boolean;
    previewWidth: number | null;
    previewHeight: number | null;
    outputFormat: OutputFormatEnum;
    outputQuality: number | null;
    outputSize: OutputSizeEnum;
    cropButtonCaption: string;
    onCropAction: {} | null;
}
