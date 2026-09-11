import { centerCrop, convertToPixelCrop, makeAspectCrop, type Crop, type PixelCrop } from "react-image-crop";

// Default selection covers `sizePercent`% of the image (widget property, default 100), centered,
// at the resolved aspect ratio. Shared by CropArea's onLoad (initial box) and Reset (re-seed the
// box to its initial state).
export function buildInitialCrop(
    img: HTMLImageElement,
    aspect: number | undefined,
    sizePercent: number
): { percentCrop: Crop; pixelCrop: PixelCrop } {
    const { naturalWidth, naturalHeight, width, height } = img;
    const safeAspect = aspect ?? naturalWidth / naturalHeight;
    // Guard against an out-of-range or non-finite configured value (e.g. 0, a negative number,
    // or NaN from a still-loading expression) rather than feeding it straight into the crop math.
    const safeSizePercent = Number.isFinite(sizePercent) ? Math.min(100, Math.max(1, sizePercent)) : 100;
    const percentCrop = centerCrop(
        makeAspectCrop({ unit: "%", width: safeSizePercent }, safeAspect, naturalWidth, naturalHeight),
        naturalWidth,
        naturalHeight
    );
    return { percentCrop, pixelCrop: convertToPixelCrop(percentCrop, width, height) };
}
