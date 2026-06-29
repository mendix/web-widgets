import { hidePropertiesIn, Properties } from "@mendix/pluggable-widgets-tools";
import {
    StructurePreviewProps,
    structurePreviewPalette,
    rowLayout,
    container,
    text
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

    const previewCaption = values.image ? `[${describeConfig(values)}] Image Cropper` : "[Configure Image Cropper]";

    return rowLayout({ columnSize: "grow", borders: true, backgroundColor: palette.background.containerFill })(
        container()(),
        rowLayout({ grow: 2, padding: 8 })(text({ fontColor: palette.text.primary, grow: 10 })(previewCaption)),
        container()()
    );
}

export function getCustomCaption(values: ImageCropperPreviewProps): string {
    const shape = values.cropShape === "circle" ? "Circle" : "Rectangle";
    return `Image Cropper (${shape})`;
}
