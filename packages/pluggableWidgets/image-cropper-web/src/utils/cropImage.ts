import type { PixelCrop } from "react-image-crop";
import { normalizeRotation, rotatedCanvasSize } from "./cropMapping";
import type { CropShapeEnum, OutputFormatEnum, OutputSizeEnum } from "../../typings/ImageCropperProps";

export class CropError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "CropError";
    }
}

export interface CropImageOptions {
    image: HTMLImageElement;
    pixelCrop: PixelCrop;
    zoom: number;
    outputFormat: OutputFormatEnum;
    outputQuality: number;
    outputSize: OutputSizeEnum;
    cropShape: CropShapeEnum;
    viewportWidth: number;
    viewportHeight: number;
    rotation: number; // degrees; snapped to 90° multiples
    grayscale: boolean;
    originalName?: string;
}

export async function cropImage(options: CropImageOptions): Promise<File> {
    const {
        image,
        pixelCrop,
        zoom,
        outputFormat,
        outputQuality,
        outputSize,
        cropShape,
        viewportWidth,
        viewportHeight,
        rotation,
        grayscale,
        originalName
    } = options;

    if (!image.naturalWidth || !image.naturalHeight) {
        throw new CropError("Image not loaded.");
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const z = zoom > 0 ? zoom : 1;

    const sx = (pixelCrop.x / z) * scaleX;
    const sy = (pixelCrop.y / z) * scaleY;
    const sw = (pixelCrop.width / z) * scaleX;
    const sh = (pixelCrop.height / z) * scaleY;

    const rot = normalizeRotation(rotation);

    // Unrotated destination size (existing behavior).
    const baseW = outputSize === "viewport" ? viewportWidth : sw;
    const baseH = outputSize === "viewport" ? viewportHeight : sh;

    // After rotation the visible canvas swaps for quarter turns.
    const dest = rotatedCanvasSize(Math.max(1, Math.round(baseW)), Math.max(1, Math.round(baseH)), rot);

    const canvas = document.createElement("canvas");
    canvas.width = dest.width;
    canvas.height = dest.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
        throw new CropError("Canvas 2D context unavailable.");
    }

    if (outputFormat === "jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (grayscale) {
        // Inert under jest-canvas-mock (no throw); applied by evergreen browsers.
        ctx.filter = "grayscale(1)";
    }

    // Rotate around the canvas center, then draw the cropped source rect centered.
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rot * Math.PI) / 180);
    // When rotated 90/270 the drawn box uses the pre-swap width/height.
    const drawW = rot === 90 || rot === 270 ? canvas.height : canvas.width;
    const drawH = rot === 90 || rot === 270 ? canvas.width : canvas.height;

    if (cropShape === "circle") {
        ctx.beginPath();
        ctx.ellipse(0, 0, drawW / 2, drawH / 2, 0, 0, Math.PI * 2);
        ctx.clip();
    }

    ctx.drawImage(image, sx, sy, sw, sh, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

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
