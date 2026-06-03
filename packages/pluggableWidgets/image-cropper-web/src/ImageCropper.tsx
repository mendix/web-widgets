import { ReactElement } from "react";
import { ImageCropperContainerProps } from "../typings/ImageCropperProps";
import { ImageCropperContainer } from "./components/ImageCropperContainer";
import "./ui/ImageCropper.scss";

export function ImageCropper(props: ImageCropperContainerProps): ReactElement | null {
    return <ImageCropperContainer {...props} />;
}
