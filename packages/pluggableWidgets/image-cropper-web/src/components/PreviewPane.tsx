import { ReactElement, useEffect, useRef } from "react";
import type { PixelCrop } from "react-image-crop";
import { computeSourceRect, type ZoomAnchor } from "../utils/cropImage";

interface PreviewPaneProps {
    image: HTMLImageElement | null;
    pixelCrop: PixelCrop | undefined;
    zoom: number;
    zoomAnchor?: ZoomAnchor;
    width: number;
    height: number;
    circle: boolean;
    grayscale: boolean;
}

export function PreviewPane({
    image,
    pixelCrop,
    zoom,
    zoomAnchor,
    width,
    height,
    circle,
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
        if (grayscale) {
            ctx.filter = "grayscale(1)";
        }
        if (circle) {
            ctx.beginPath();
            ctx.ellipse(width / 2, height / 2, width / 2, height / 2, 0, 0, Math.PI * 2);
            ctx.clip();
        }
        const { sx, sy, sw, sh } = computeSourceRect(pixelCrop, image, zoom, zoomAnchor);
        ctx.drawImage(image, sx, sy, sw, sh, 0, 0, width, height);
    }, [image, pixelCrop, zoom, zoomAnchor, width, height, circle, grayscale]);

    return <canvas ref={canvasRef} className="widget-image-cropper__preview" width={width} height={height} />;
}
