import { centerCrop, convertToPixelCrop, makeAspectCrop, type Crop, type PixelCrop } from "react-image-crop";

// Mirrors the defaultValue of the "Initial crop size (%)" property in ImageCropper.xml.
export const DEFAULT_INITIAL_CROP_SIZE = 80;

// Default selection covers `sizePercent`% of the largest box that fits the image at the resolved
// aspect ratio, centered. Scaling the fitted box (rather than the image width) keeps the size
// meaningful when the ratio is height-limited, e.g. 1:1 on a landscape image. Shared by
// CropArea's onLoad (initial box) and Reset (re-seed the box to its initial state).
export function buildInitialCrop(
    img: HTMLImageElement,
    aspect: number | undefined,
    sizePercent: number
): { percentCrop: Crop; pixelCrop: PixelCrop } {
    const { naturalWidth, naturalHeight, width, height } = img;
    const safeAspect = aspect ?? naturalWidth / naturalHeight;
    // Studio Pro flags values outside 1-100 but still lets the app run, so clamp them here
    // rather than feeding them straight into the crop math.
    const safeSizePercent = Number.isFinite(sizePercent)
        ? Math.min(100, Math.max(1, sizePercent))
        : DEFAULT_INITIAL_CROP_SIZE;
    const fitted = makeAspectCrop({ unit: "%", width: 100 }, safeAspect, naturalWidth, naturalHeight);
    const scale = safeSizePercent / 100;
    const percentCrop = centerCrop(
        { unit: "%", width: fitted.width * scale, height: fitted.height * scale },
        naturalWidth,
        naturalHeight
    );
    return { percentCrop, pixelCrop: convertToPixelCrop(percentCrop, width, height) };
}
