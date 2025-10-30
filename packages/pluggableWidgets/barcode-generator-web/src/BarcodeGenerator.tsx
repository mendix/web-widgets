import JsBarcode from "jsbarcode";
import { QRCodeSVG } from "qrcode.react";
import { ReactElement, useEffect, useRef } from "react";
import { BarcodeGeneratorContainerProps } from "../typings/BarcodeGeneratorProps";

import "./ui/BarcodeGenerator.scss";

export default function BarcodeGenerator({
    codeValue,
    codeWidth,
    codeHeight,
    codeFormat,
    codeMargin,
    displayValue,
    qrSize,
    tabIndex
}: BarcodeGeneratorContainerProps): ReactElement {
    const svgRef = useRef<SVGSVGElement>(null);

    const value = codeValue?.status === "available" ? codeValue.value : "";
    const width = codeWidth ?? 128;
    const height = codeHeight ?? 128;
    const format = codeFormat ?? "CODE128";
    const margin = codeMargin ?? 2;
    const showValue = displayValue ?? false;
    const size = qrSize ?? 128;

    useEffect(() => {
        if (format !== "QRCode" && svgRef.current && value) {
            try {
                JsBarcode(svgRef.current, value, {
                    format,
                    width,
                    height,
                    margin,
                    displayValue: showValue
                });
            } catch (error) {
                console.error("Error generating barcode:", error);
            }
        }
    }, [value, width, height, format, margin, showValue]);

    if (!value) {
        return <span>No barcode value provided</span>;
    }

    return (
        <div className="barcode-generator" tabIndex={tabIndex}>
            {format === "QRCode" ? <QRCodeSVG value={value} size={size} /> : <svg ref={svgRef} />}
        </div>
    );
}
