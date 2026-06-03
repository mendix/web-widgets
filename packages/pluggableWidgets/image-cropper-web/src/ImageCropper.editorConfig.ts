import { hidePropertiesIn, Properties } from "@mendix/pluggable-widgets-tools";
import {
    StructurePreviewProps,
    structurePreviewPalette
} from "@mendix/widget-plugin-platform/preview/structure-preview-api";
import { ImageCropperPreviewProps } from "../typings/ImageCropperProps";
import CropIconSvg from "./assets/crop-icon.svg";

export function getProperties(values: ImageCropperPreviewProps, defaultProperties: Properties): Properties {
    const propsToHide: Array<keyof ImageCropperPreviewProps> = [];

    if (values.aspectRatio !== "custom") {
        propsToHide.push("customAspectWidth", "customAspectHeight");
    }

    if (!values.zoomEnabled) {
        propsToHide.push("showZoomSlider", "wheelZoomMode", "minZoom", "maxZoom");
    }

    if (!values.showPreview) {
        propsToHide.push("previewWidth", "previewHeight");
    }

    if (values.outputFormat !== "jpeg") {
        propsToHide.push("outputQuality");
    }

    hidePropertiesIn(defaultProperties, values, propsToHide);
    return defaultProperties;
}

export function getPreview(values: ImageCropperPreviewProps, isDarkMode: boolean): StructurePreviewProps {
    const palette = structurePreviewPalette[isDarkMode ? "dark" : "light"];
    const iconDocument = decodeURIComponent(CropIconSvg.replace("data:image/svg+xml,", ""));

    return {
        type: "Container",
        borders: true,
        borderRadius: 4,
        backgroundColor: palette.background.containerFill,
        children: [
            {
                type: "RowLayout",
                columnSize: "grow",
                padding: 12,
                children: [
                    {
                        type: "Container",
                        grow: 0,
                        padding: 4,
                        children: [
                            {
                                type: "Image",
                                document: iconDocument,
                                width: 28,
                                height: 22
                            }
                        ]
                    },
                    {
                        type: "Container",
                        grow: 1,
                        children: [
                            {
                                type: "Text",
                                content: "Image Cropper",
                                bold: true,
                                fontColor: palette.text.primary,
                                fontSize: 10
                            },
                            {
                                type: "Text",
                                content: describeConfig(values),
                                fontColor: palette.text.secondary,
                                fontSize: 8
                            }
                        ]
                    }
                ]
            }
        ]
    };
}

export function getCustomCaption(values: ImageCropperPreviewProps): string {
    const shape = values.cropShape === "circle" ? "Circle" : "Rectangle";
    return `Image Cropper (${shape})`;
}

function describeConfig(values: ImageCropperPreviewProps): string {
    const parts: string[] = [];
    parts.push(values.cropShape === "circle" ? "Circle" : "Rectangle");
    parts.push(aspectLabel(values));
    parts.push(`${values.outputFormat.toUpperCase()} · ${values.outputSize === "viewport" ? "Viewport" : "Original"}`);
    return parts.join(" · ");
}

function aspectLabel(values: ImageCropperPreviewProps): string {
    switch (values.aspectRatio) {
        case "free":
            return "Free aspect";
        case "square":
            return "1:1";
        case "landscape16x9":
            return "16:9";
        case "landscape4x3":
            return "4:3";
        case "portrait3x4":
            return "3:4";
        case "custom":
            return `${values.customAspectWidth}:${values.customAspectHeight}`;
        default: {
            const _exhaustive: never = values.aspectRatio;
            return _exhaustive;
        }
    }
}
