import { hidePropertiesIn, Properties } from "@mendix/pluggable-widgets-tools";
import { ImageCropPreviewProps } from "../typings/ImageCropProps";

export function getProperties(values: ImageCropPreviewProps, defaultProperties: Properties): Properties {
    const propsToHide: Array<keyof ImageCropPreviewProps> = [];

    if (values.aspectRatio !== "custom") {
        propsToHide.push("customAspectWidth", "customAspectHeight");
    }

    if (!values.zoomEnabled) {
        propsToHide.push("wheelZoomMode", "minZoom", "maxZoom");
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
