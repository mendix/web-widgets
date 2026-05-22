import type { PixelCrop } from "react-image-crop";
import type { CropShapeEnum, OutputFormatEnum, OutputSizeEnum } from "../../typings/ImageCropProps";

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
        viewportHeight
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

    const destW = outputSize === "viewport" ? viewportWidth : sw;
    const destH = outputSize === "viewport" ? viewportHeight : sh;

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(destW));
    canvas.height = Math.max(1, Math.round(destH));

    const ctx = canvas.getContext("2d");
    if (!ctx) {
        throw new CropError("Canvas 2D context unavailable.");
    }

    if (outputFormat === "jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (cropShape === "circle") {
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(canvas.width / 2, canvas.height / 2, canvas.width / 2, canvas.height / 2, 0, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
    }

    ctx.drawImage(image, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

    if (cropShape === "circle") {
        ctx.restore();
    }

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

    return new File([blob], `crop-${Date.now()}.${ext}`, { type: mime });
}
