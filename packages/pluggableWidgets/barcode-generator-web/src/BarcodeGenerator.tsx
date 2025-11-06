import { ReactElement, useRef } from "react";
import { BarcodeGeneratorContainerProps } from "../typings/BarcodeGeneratorProps";
import { useDownload } from "./hooks/useDownload";
import { CodeRenderer } from "./components/CodeRenderer";

import "./ui/BarcodeGenerator.scss";

export default function BarcodeGenerator({
    codeValue,
    codeWidth,
    codeHeight,
    codeFormat,
    codeMargin,
    displayValue,
    qrSize,
    tabIndex,
    allowDownload
}: BarcodeGeneratorContainerProps): ReactElement {
    const svgRef = useRef<SVGSVGElement>(null);
    const qrContainerRef = useRef<HTMLDivElement>(null);

    const value = codeValue?.status === "available" ? codeValue.value : "";
    const width = codeWidth ?? 128;
    const height = codeHeight ?? 128;
    const format = codeFormat ?? "CODE128";
    const margin = codeMargin ?? 2;
    const showValue = displayValue ?? false;
    const download = allowDownload ?? false;
    const size = qrSize ?? 128;

    const { downloadSVG } = useDownload({ format, svgRef, qrContainerRef });

    if (!value) {
        return <span>No barcode value provided</span>;
    }

    return (
        <div className="barcode-generator" tabIndex={tabIndex}>
            <CodeRenderer
                format={format}
                value={value}
                size={size}
                width={width}
                height={height}
                margin={margin}
                displayValue={showValue}
                svgRef={svgRef}
                qrContainerRef={qrContainerRef}
            />
            {download && (
                <button type="button" onClick={downloadSVG} className="btn btn-default">
                    Download {format === "QRCode" ? "QR Code" : "Barcode"}
                </button>
            )}
        </div>
    );
}
