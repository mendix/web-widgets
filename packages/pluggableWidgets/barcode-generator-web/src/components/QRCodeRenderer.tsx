import { QRCodeSVG } from "qrcode.react";
import { ComponentType, forwardRef } from "react";

const QRCode = QRCodeSVG as ComponentType<{
    value: string;
    size: number;
    level: string;
    marginSize: number;
    title: string;
    imageSettings?: {
        src: string;
        x?: number;
        y?: number;
        height: number;
        width: number;
        opacity: number;
        excavate: boolean;
    };
}>;

interface QRCodeRendererProps {
    value: string;
    size: number;
    margin: number;
    title: string;
    level: string;
    imageSrc?: string;
    imageX?: number;
    imageY?: number;
    imageHeight: number;
    imageWidth: number;
    imageOpacity: number;
    imageExcavate: boolean;
}

export const QRCodeRenderer = forwardRef<HTMLDivElement, QRCodeRendererProps>(
    (
        {
            value,
            size,
            margin,
            title,
            level,
            imageSrc,
            imageX,
            imageY,
            imageHeight,
            imageWidth,
            imageOpacity,
            imageExcavate
        },
        ref
    ) => {
        const imageSettings = imageSrc
            ? {
                  src: imageSrc,
                  x: imageX,
                  y: imageY,
                  height: imageHeight,
                  width: imageWidth,
                  opacity: imageOpacity,
                  excavate: imageExcavate
              }
            : undefined;

        return (
            <div ref={ref}>
                <QRCode
                    value={value}
                    size={size}
                    level={level}
                    marginSize={margin}
                    title={title}
                    imageSettings={imageSettings}
                />
            </div>
        );
    }
);
