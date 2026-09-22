/**
 * This file was generated from ImageCropper.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ActionValue, DynamicValue, EditableImageValue, WebImage } from "mendix";
import { Big } from "big.js";
import { CSSProperties } from "react";

export type CropShapeEnum = "rect" | "circle";

export type AspectRatioEnum = "free" | "square" | "landscape16x9" | "landscape4x3" | "portrait3x4" | "custom";

export type WheelZoomModeEnum = "off" | "on" | "onWithCtrl";

export type OutputFormatEnum = "png" | "jpeg";

export type OutputSizeEnum = "viewport" | "original";

export interface ImageCropperContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    image: EditableImageValue<WebImage>;
    cropShape: CropShapeEnum;
    aspectRatio: AspectRatioEnum;
    customAspectWidth: DynamicValue<Big>;
    customAspectHeight: DynamicValue<Big>;
    initialCropSize: number;
    onCropAction?: ActionValue;
    boundaryWidth: number;
    boundaryHeight: number;
    resizableEnabled: boolean;
    enableRotation: boolean;
    enableGrayscale: boolean;
    showResetButton: boolean;
    zoomEnabled: boolean;
    showZoomSlider: boolean;
    wheelZoomMode: WheelZoomModeEnum;
    minZoom: Big;
    maxZoom: Big;
    grayscaleCaption?: DynamicValue<string>;
    resetCaption?: DynamicValue<string>;
    zoomCaption?: DynamicValue<string>;
    noImageCaption?: DynamicValue<string>;
    rotateLeftLabel?: DynamicValue<string>;
    rotateRightLabel?: DynamicValue<string>;
    grayscaleAriaLabel?: DynamicValue<string>;
    resetAriaLabel?: DynamicValue<string>;
    zoomAriaLabel?: DynamicValue<string>;
    outputFormat: OutputFormatEnum;
    outputQuality: Big;
    outputSize: OutputSizeEnum;
}

export interface ImageCropperPreviewProps {
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
    image: { type: "static"; imageUrl: string } | { type: "dynamic"; entity: string } | null;
    cropShape: CropShapeEnum;
    aspectRatio: AspectRatioEnum;
    customAspectWidth: string;
    customAspectHeight: string;
    initialCropSize: number | null;
    onCropAction: {} | null;
    boundaryWidth: number | null;
    boundaryHeight: number | null;
    resizableEnabled: boolean;
    enableRotation: boolean;
    enableGrayscale: boolean;
    showResetButton: boolean;
    zoomEnabled: boolean;
    showZoomSlider: boolean;
    wheelZoomMode: WheelZoomModeEnum;
    minZoom: number | null;
    maxZoom: number | null;
    grayscaleCaption: string;
    resetCaption: string;
    zoomCaption: string;
    noImageCaption: string;
    rotateLeftLabel: string;
    rotateRightLabel: string;
    grayscaleAriaLabel: string;
    resetAriaLabel: string;
    zoomAriaLabel: string;
    outputFormat: OutputFormatEnum;
    outputQuality: number | null;
    outputSize: OutputSizeEnum;
}
