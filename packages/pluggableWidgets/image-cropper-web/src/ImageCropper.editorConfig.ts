import { hidePropertiesIn, Properties } from "@mendix/pluggable-widgets-tools";
import {
    StructurePreviewProps,
    structurePreviewPalette
} from "@mendix/widget-plugin-platform/preview/structure-preview-api";
import { ImageCropperPreviewProps } from "../typings/ImageCropperProps";
import { describeConfig } from "./utils/describeConfig";

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

    return {
        type: "Container",
        borders: true,
        borderRadius: 4,
        backgroundColor: palette.background.container,
        children: [
            {
                type: "RowLayout",
                columnSize: "grow",
                backgroundColor: palette.background.topbarStandard,
                borders: true,
                borderWidth: 1,
                padding: 8,
                children: [
                    {
                        type: "Text",
                        content: "Image cropper",
                        fontColor: palette.text.primary,
                        fontSize: 10
                    }
                ]
            },
            {
                type: "Container",
                padding: 8,
                children: [
                    {
                        type: "Text",
                        content: values.image ? describeConfig(values) : "[No attribute selected]",
                        fontColor: palette.text.secondary,
                        fontSize: 9
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
