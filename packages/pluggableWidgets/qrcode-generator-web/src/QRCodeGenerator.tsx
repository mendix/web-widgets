import { createElement, ReactElement, useEffect, useRef } from "react";
import { QRCodeGeneratorContainerProps } from "../typings/QRCodeGeneratorProps";
import { QRCodeSVG } from "qrcode.react";
import JsBarcode from "jsbarcode";

import "./ui/QRCodeGenerator.scss";

export default function QRCodeGenerator({
    codeValue,
    codeWidth,
    codeHeight,
    codeFormat,
    codeMargin,
    displayValue,
    qrSize,
    tabIndex
}: QRCodeGeneratorContainerProps): ReactElement {
    const svgRef = useRef<SVGSVGElement>(null);

    const value = codeValue?.status === "available" ? codeValue.value : "";
    const width = codeWidth ?? 128;
    const height = codeHeight ?? 128;
    const format = codeFormat ?? "CODE128";
    const margin = codeMargin ?? 2;
    const showValue = displayValue ?? false;
    const size = qrSize ?? 128;

    useEffect(() => {
        if (format !== "QR" && svgRef.current && value) {
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
            {format === "QR" ? <QRCodeSVG value={value} size={size} /> : <svg ref={svgRef} />}
        </div>
    );
}
