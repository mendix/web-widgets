import type { PixelCrop } from "react-image-crop";
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
