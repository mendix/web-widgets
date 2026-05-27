import classNames from "classnames";
import { ReactElement } from "react";
import { ImageCropPreviewProps } from "../typings/ImageCropProps";

export function preview(props: ImageCropPreviewProps): ReactElement {
    return (
        <div className={classNames(props.class, "widget-image-crop", "widget-image-crop--preview")}>
            <div className="widget-image-crop__dropzone">
                <div className="widget-image-crop__icon" />
                <p className="widget-image-crop__label">Image Crop</p>
            </div>
        </div>
    );
}

export function getPreviewCss(): string {
    return require("./ui/ImageCrop.scss");
}
