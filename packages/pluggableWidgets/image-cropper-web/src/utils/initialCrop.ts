import { centerCrop, convertToPixelCrop, makeAspectCrop, type Crop, type PixelCrop } from "react-image-crop";

// Default selection covers 80% of the image, centered, at the resolved aspect ratio.
// Shared by CropArea's onLoad (initial box) and Reset (re-seed the box to its initial state).
export function buildInitialCrop(
    img: HTMLImageElement,
    aspect: number | undefined
): { percentCrop: Crop; pixelCrop: PixelCrop } {
    const { naturalWidth, naturalHeight, width, height } = img;
    const safeAspect = aspect ?? naturalWidth / naturalHeight;
    const percentCrop = centerCrop(
        makeAspectCrop({ unit: "%", width: 80 }, safeAspect, naturalWidth, naturalHeight),
        naturalWidth,
        naturalHeight
    );
    return { percentCrop, pixelCrop: convertToPixelCrop(percentCrop, width, height) };
}
