import { createElement, ReactElement, useMemo } from "react";
import { QRCodeGeneratorContainerProps } from "../typings/QRCodeGeneratorProps";
import { QRCodeSVG } from "qrcode.react"; // Changed to named import QRCodeSVG
import "./ui/QRCodeGenerator.scss";

export default function QRCodeGenerator({
    qrValue,
    qrSize,
    qrMargin,
    tabIndex
}: QRCodeGeneratorContainerProps): ReactElement {
    // Handle Mendix data binding
    const value = qrValue?.status === "available" ? qrValue.value : "";
    const size = qrSize ?? 128;
    const margin = qrMargin ?? 2;

    // Memoize QR code rendering
    const qrCode = useMemo(() => {
        if (!value) return null;
        return (
            <QRCodeSVG
                value={value}
                size={size}
                level="M" // Error correction level
                marginSize={margin ?? 2}
                aria-label={`QR code for: ${value}`}
            />
        );
    }, [value, size, margin]);

    return (
        <div className="qr-code-widget" tabIndex={tabIndex}>
            {qrCode ?? (
                <span className="text-muted">
                    {qrValue?.status === "loading" ? "Loading..." : "No QR code to display"}
                </span>
            )}
        </div>
    );
}
