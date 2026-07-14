import type { PixelCrop } from "react-image-crop";
import type { CropShapeEnum, OutputFormatEnum, OutputSizeEnum } from "../../typings/ImageCropperProps";

export class CropError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "CropError";
    }
}

export interface SourceRect {
    sx: number;
    sy: number;
    sw: number;
    sh: number;
}

// Fixed point of the CSS zoom, as fractions (0..1) of the displayed image. The center of the
// initial cropbox is {x: 0.5, y: 0.5}. Owned by the container so display and export share it.
export interface ZoomAnchor {
    x: number;
    y: number;
}

// Default anchor (image center) for callers that predate frozen anchors / have none yet.
export const CENTER_ANCHOR: ZoomAnchor = { x: 0.5, y: 0.5 };

/**
 * Maps the crop box (in the displayed image's unscaled layout px) to a source rectangle on the
 * natural image. Zoom is a CSS `transform: scale(z)` anchored on `anchor` (a fixed point that
 * stays put on screen while scaling), so the visible region shrinks by 1/z about that point.
 * Used by cropImage (export) so exported pixels match the on-screen framing.
 * Result is clamped to the image. When anchor == the crop-box center this reduces to the plain
 * "zoom into the box" mapping.
 */
export function computeSourceRect(
    pixelCrop: PixelCrop,
    image: HTMLImageElement,
    zoom: number,
    anchor: ZoomAnchor = CENTER_ANCHOR
): SourceRect {
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const z = zoom > 0 ? zoom : 1;

    const sw = (pixelCrop.width / z) * scaleX;
    const sh = (pixelCrop.height / z) * scaleY;

    // Anchor in natural px (anchor is a fraction of the displayed image; * width * scaleX == * natural).
    const ox = anchor.x * image.naturalWidth;
    const oy = anchor.y * image.naturalHeight;
    // Invert screen = O + z·(layout − O): the layout point under the crop box top-left is
    // O + (cropTopLeft − O)/z. Collapses to (center − sw/2) when the anchor is the box center.
    let sx = ox + (pixelCrop.x * scaleX - ox) / z;
    let sy = oy + (pixelCrop.y * scaleY - oy) / z;

    // Keep the read window inside the image (guards zoom-out, z<1, from reading off-canvas).
    sx = Math.max(0, Math.min(sx, image.naturalWidth - sw));
    sy = Math.max(0, Math.min(sy, image.naturalHeight - sh));

    return { sx, sy, sw, sh };
}

export interface CropImageOptions {
    image: HTMLImageElement;
    pixelCrop: PixelCrop;
    zoom: number;
    zoomAnchor?: ZoomAnchor;
    outputFormat: OutputFormatEnum;
    outputQuality: number;
    outputSize: OutputSizeEnum;
    cropShape: CropShapeEnum;
    viewportWidth: number;
    viewportHeight: number;
    grayscale: boolean;
    originalName?: string;
}

export async function cropImage(options: CropImageOptions): Promise<File> {
    const {
        image,
        pixelCrop,
        zoom,
        zoomAnchor,
        outputFormat,
        outputQuality,
        outputSize,
        cropShape,
        viewportWidth,
        viewportHeight,
        grayscale,
        originalName
    } = options;

    if (!image.naturalWidth || !image.naturalHeight) {
        throw new CropError("Image not loaded.");
    }

    const { sx, sy, sw, sh } = computeSourceRect(pixelCrop, image, zoom, zoomAnchor);

    const destW = Math.max(1, Math.round(outputSize === "viewport" ? viewportWidth : sw));
    const destH = Math.max(1, Math.round(outputSize === "viewport" ? viewportHeight : sh));

    const canvas = document.createElement("canvas");
    canvas.width = destW;
    canvas.height = destH;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
        throw new CropError("Canvas 2D context unavailable.");
    }

    if (outputFormat === "jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, destW, destH);
    }

    if (grayscale) {
        ctx.filter = "grayscale(1)";
    }

    if (cropShape === "circle") {
        ctx.beginPath();
        ctx.ellipse(destW / 2, destH / 2, destW / 2, destH / 2, 0, 0, Math.PI * 2);
        ctx.clip();
    }

    ctx.drawImage(image, sx, sy, sw, sh, 0, 0, destW, destH);

    const mime = outputFormat === "jpeg" ? "image/jpeg" : "image/png";
    const ext = outputFormat === "jpeg" ? "jpg" : "png";
    const quality = outputFormat === "jpeg" ? Math.min(1, Math.max(0, outputQuality)) : undefined;

    const blob = await new Promise<Blob | null>(resolve => {
        try {
            canvas.toBlob(resolve, mime, quality);
        } catch (_e) {
            resolve(null);
        }
    });

    if (!blob) {
        throw new CropError(
            "Could not export the cropped image. The source may be tainted by cross-origin restrictions."
        );
    }

    const baseName = originalName ? originalName.replace(/\.[^.]+$/, "") : `crop-${Date.now()}`;
    return new File([blob], `${baseName}.${ext}`, { type: mime });
}
