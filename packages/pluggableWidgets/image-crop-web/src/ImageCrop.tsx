import { ReactElement } from "react";
import { ImageCropContainerProps } from "../typings/ImageCropProps";
import { ImageCropContainer } from "./components/ImageCropContainer";

export function ImageCrop(props: ImageCropContainerProps): ReactElement | null {
    return <ImageCropContainer {...props} />;
}
