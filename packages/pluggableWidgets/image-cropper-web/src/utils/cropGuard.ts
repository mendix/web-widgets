import type { PixelCrop } from "react-image-crop";

// Below this fraction of the displayed image an incoming crop is treated as a stray click
// (react-image-crop emits a ~0-size crop on mousedown+mouseup with no drag) rather than a real
// draw. We dropped keepSelection to allow drawing a fresh box, so without this guard a stray
// click would replace the existing box with a 0-size selection.
export const MIN_DRAW_FRACTION = 0.02;

// Floor size (px, in displayed-image space) for a box the user actively drags — passed to
// <ReactCrop minWidth/minHeight>, which only clamps during an actual drag-move.
export const MIN_CROP_PX = 16;

/**
 * True when the crop is too small to be a deliberate draw, given the displayed image size.
 * When displaySize is unknown (before the image loads) nothing is filtered.
 */
export function isStrayCrop(pixel: PixelCrop, displaySize: { width: number; height: number } | null): boolean {
    if (!displaySize) {
        return false;
    }
    const minW = displaySize.width * MIN_DRAW_FRACTION;
    const minH = displaySize.height * MIN_DRAW_FRACTION;
    return pixel.width < minW || pixel.height < minH;
}
