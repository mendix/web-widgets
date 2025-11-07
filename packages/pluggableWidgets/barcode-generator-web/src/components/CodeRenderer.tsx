import { ReactElement } from "react";
import { QRCodeRenderer } from "./QRCodeRenderer";
import { BarcodeRenderer } from "./BarcodeRenderer";

interface CodeRendererProps {
    value: string;
    format: string;
    // Barcode props
    width: number;
    height: number;
    margin: number;
    displayValue: boolean;
    // QR Code props
    qrsize: number;
    qrmargin: number;
    qrtitle: string;
    qrlevel: string;
    qrimageSrc: string;
    qrimageX?: number;
    qrimageY?: number;
    qrimageHeight: number;
    qrimageWidth: number;
    qrimageOpacity: number;
    qrimageExcavate: boolean;
    // Refs for download functionality
    svgRef: React.RefObject<SVGSVGElement>;
    qrContainerRef: React.RefObject<HTMLDivElement>;
}

export function CodeRenderer({
    value,
    format,
    width,
    height,
    margin,
    displayValue,
    qrsize,
    qrmargin,
    qrtitle,
    qrlevel,
    qrimageSrc,
    qrimageX,
    qrimageY,
    qrimageHeight,
    qrimageWidth,
    qrimageOpacity,
    qrimageExcavate,
    svgRef,
    qrContainerRef
}: CodeRendererProps): ReactElement {
    if (format === "QRCode") {
        return (
            <QRCodeRenderer
                ref={qrContainerRef}
                value={value}
                size={qrsize}
                margin={qrmargin}
                title={qrtitle}
                level={qrlevel}
                imageSrc={qrimageSrc}
                imageX={qrimageX}
                imageY={qrimageY}
                imageHeight={qrimageHeight}
                imageWidth={qrimageWidth}
                imageOpacity={qrimageOpacity}
                imageExcavate={qrimageExcavate}
            />
        );
    }

    return (
        <BarcodeRenderer
            value={value}
            format={format}
            width={width}
            height={height}
            margin={margin}
            displayValue={displayValue}
            ref={svgRef}
        />
    );
}
