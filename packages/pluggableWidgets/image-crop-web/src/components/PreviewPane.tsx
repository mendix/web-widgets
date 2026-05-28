import { ReactElement, useEffect, useRef } from "react";
import type { PixelCrop } from "react-image-crop";

interface PreviewPaneProps {
    image: HTMLImageElement | null;
    pixelCrop: PixelCrop | undefined;
    zoom: number;
    width: number;
    height: number;
    circle: boolean;
}

export function PreviewPane({ image, pixelCrop, zoom, width, height, circle }: PreviewPaneProps): ReactElement {
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
        if (circle) {
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(width / 2, height / 2, width / 2, height / 2, 0, 0, Math.PI * 2);
            ctx.clip();
        }
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        const z = zoom > 0 ? zoom : 1;
        ctx.drawImage(
            image,
            (pixelCrop.x / z) * scaleX,
            (pixelCrop.y / z) * scaleY,
            (pixelCrop.width / z) * scaleX,
            (pixelCrop.height / z) * scaleY,
            0,
            0,
            width,
            height
        );
        if (circle) {
            ctx.restore();
        }
    }, [image, pixelCrop, zoom, width, height, circle]);

    return <canvas ref={canvasRef} className="widget-image-crop__preview" width={width} height={height} />;
}
