import classNames from "classnames";
import { ReactElement } from "react";
import { ImageCropperPreviewProps } from "../typings/ImageCropperProps";

export function preview(props: ImageCropperPreviewProps): ReactElement {
    return (
        <div className={classNames(props.class, "widget-image-cropper", "widget-image-cropper--preview")}>
            <div className="widget-image-cropper__dropzone">
                <div className="widget-image-cropper__icon" />
                <p className="widget-image-cropper__label">Image Cropper</p>
                <p className="widget-image-cropper__hint">Bind an image attribute to crop</p>
            </div>
        </div>
    );
}

export function getPreviewCss(): string {
    return require("./ui/ImageCropper.scss");
}
