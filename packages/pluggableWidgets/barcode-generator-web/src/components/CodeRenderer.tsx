import { ReactElement, RefObject } from "react";
import { QRCodeRenderer } from "./QRCodeRenderer";
import { BarcodeRenderer } from "./BarcodeRenderer";

interface CodeRendererProps {
    value: string;
    format: string;
    width: number;
    height: number;
    margin: number;
    displayValue: boolean;
    enableEan128: boolean;
    enableFlat: boolean;
    lastChar: string;
    enableMod43: boolean;
    addonValue?: string;
    addonFormat?: string;
    addonSpacing?: number;
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
    svgRef: RefObject<SVGSVGElement>;
    qrContainerRef: RefObject<HTMLDivElement>;
}

export function CodeRenderer({
    value,
    format,
    width,
    height,
    margin,
    displayValue,
    enableEan128,
    enableFlat,
    lastChar,
    enableMod43,
    addonValue,
    addonFormat,
    addonSpacing,
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
            enableEan128={enableEan128}
            enableFlat={enableFlat}
            lastChar={lastChar}
            enableMod43={enableMod43}
            addonValue={addonValue}
            addonFormat={addonFormat}
            addonSpacing={addonSpacing}
            ref={svgRef}
        />
    );
}
