import { QRCodeSVG } from "qrcode.react";
import { forwardRef } from "react";

const QRCode = QRCodeSVG as React.ComponentType<{ value: string; size: number }>;

interface QRCodeRendererProps {
    value: string;
    size: number;
}

export const QRCodeRenderer = forwardRef<HTMLDivElement, QRCodeRendererProps>(({ value, size }, ref) => {
    return (
        <div ref={ref}>
            <QRCode value={value} size={size} />
        </div>
    );
});
