import { ImageCropperPreviewProps } from "../../typings/ImageCropperProps";

// Shared by both editor surfaces: structure mode (editorConfig getPreview) renders this as the
// body row, design mode (editorPreview) renders it as the caption under the static image.
export function describeConfig(values: ImageCropperPreviewProps): string {
    const parts: string[] = [];
    parts.push(values.cropShape === "circle" ? "Circle" : "Rectangle");
    parts.push(aspectLabel(values));
    parts.push(`${values.outputFormat.toUpperCase()} · ${values.outputSize === "viewport" ? "Viewport" : "Original"}`);
    return parts.join(" · ");
}

export function aspectLabel(values: ImageCropperPreviewProps): string {
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
