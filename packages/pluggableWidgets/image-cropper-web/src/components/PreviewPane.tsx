import { ReactElement, useEffect, useRef } from "react";
import type { PixelCrop } from "react-image-crop";
import { normalizeRotation } from "../utils/cropMapping";

interface PreviewPaneProps {
    image: HTMLImageElement | null;
    pixelCrop: PixelCrop | undefined;
    zoom: number;
    width: number;
    height: number;
    circle: boolean;
    rotation: number;
    grayscale: boolean;
}

export function PreviewPane({
    image,
    pixelCrop,
    zoom,
    width,
    height,
    circle,
    rotation,
    grayscale
}: PreviewPaneProps): ReactElement {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !image || !pixelCrop || !image.naturalWidth) {
            return;
        }

        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            return;
        }
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, width, height);
        if (pixelCrop.width === 0 || pixelCrop.height === 0) {
            // Why: drawImage with a 0-sized source rect throws IndexSizeError in node-canvas / older Safari.
            return;
        }
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        const z = zoom > 0 ? zoom : 1;
        const rot = normalizeRotation(rotation);
        if (grayscale) {
            ctx.filter = "grayscale(1)";
        }
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.rotate((rot * Math.PI) / 180);
        const drawW = rot === 90 || rot === 270 ? height : width;
        const drawH = rot === 90 || rot === 270 ? width : height;
        if (circle) {
            ctx.beginPath();
            ctx.ellipse(0, 0, drawW / 2, drawH / 2, 0, 0, Math.PI * 2);
            ctx.clip();
        }
        ctx.drawImage(
            image,
            (pixelCrop.x / z) * scaleX,
            (pixelCrop.y / z) * scaleY,
            (pixelCrop.width / z) * scaleX,
            (pixelCrop.height / z) * scaleY,
            -drawW / 2,
            -drawH / 2,
            drawW,
            drawH
        );
        ctx.restore();
    }, [image, pixelCrop, zoom, width, height, circle, rotation, grayscale]);

    return <canvas ref={canvasRef} className="widget-image-cropper__preview" width={width} height={height} />;
}
