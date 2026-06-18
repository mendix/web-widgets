import { CropError } from "./cropImage";
import { normalizeRotation, rotatedCanvasSize } from "./cropMapping";
import type { OutputFormatEnum } from "../../typings/ImageCropperProps";

export interface RotateImageOptions {
    image: HTMLImageElement;
    rotation: number; // delta degrees; snapped to 90° multiples
    outputFormat: OutputFormatEnum;
    outputQuality: number;
    grayscale: boolean;
    originalName?: string;
}

export async function rotateImage(options: RotateImageOptions): Promise<File> {
    const { image, rotation, outputFormat, outputQuality, grayscale, originalName } = options;
    const nw = image.naturalWidth;
    const nh = image.naturalHeight;
    if (!nw || !nh) {
        throw new CropError("Image not loaded.");
    }
    const rot = normalizeRotation(rotation);
    const dest = rotatedCanvasSize(nw, nh, rot);

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
        // Bake B&W here too: rotate replaces the staged file, so without this a
        // grayscale-then-rotate-then-Save would persist a color image.
        ctx.filter = "grayscale(1)";
    }
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rot * Math.PI) / 180);
    ctx.drawImage(image, 0, 0, nw, nh, -nw / 2, -nh / 2, nw, nh);
    ctx.restore();

    const mime = outputFormat === "jpeg" ? "image/jpeg" : "image/png";
    const ext = outputFormat === "jpeg" ? "jpg" : "png";
    const quality = outputFormat === "jpeg" ? Math.min(1, Math.max(0, outputQuality)) : undefined;
    const blob = await new Promise<Blob | null>(resolve => {
        try {
            canvas.toBlob(resolve, mime, quality);
        } catch {
            resolve(null);
        }
    });
    if (!blob) {
        throw new CropError("Could not export the rotated image (canvas may be tainted).");
    }
    const baseName = originalName ? originalName.replace(/\.[^.]+$/, "") : `rotate-${Date.now()}`;
    return new File([blob], `${baseName}.${ext}`, { type: mime });
}
