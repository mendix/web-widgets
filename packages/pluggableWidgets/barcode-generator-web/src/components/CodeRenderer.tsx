import { ReactElement } from "react";
import { QRCodeRenderer } from "./QRCodeRenderer";
import { BarcodeRenderer } from "./BarcodeRenderer";

interface CodeRendererProps {
    format: string;
    value: string;
    // QR Code props
    size: number;
    // Barcode props
    width: number;
    height: number;
    margin: number;
    displayValue: boolean;
    // Refs for download functionality
    svgRef: React.RefObject<SVGSVGElement>;
    qrContainerRef: React.RefObject<HTMLDivElement>;
}

export function CodeRenderer({
    format,
    value,
    size,
    width,
    height,
    margin,
    displayValue,
    svgRef,
    qrContainerRef
}: CodeRendererProps): ReactElement {
    if (format === "QRCode") {
        return <QRCodeRenderer ref={qrContainerRef} value={value} size={size} />;
    }

    return (
        <BarcodeRenderer
            ref={svgRef}
            value={value}
            width={width}
            height={height}
            format={format}
            margin={margin}
            displayValue={displayValue}
        />
    );
}
