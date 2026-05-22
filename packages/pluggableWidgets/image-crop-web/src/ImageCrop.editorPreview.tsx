import { ReactElement } from "react";
import { ImageCropPreviewProps } from "../typings/ImageCropProps";

export function preview(_props: ImageCropPreviewProps): ReactElement {
    return <div className="widget-image-crop widget-image-crop--preview">Image Crop</div>;
}

export function getPreviewCss(): string {
    return "";
}
