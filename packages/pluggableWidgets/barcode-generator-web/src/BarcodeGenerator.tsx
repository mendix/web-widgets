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
    customCodeFormat,
    codeMargin,
    displayValue,
    qrSize,
    qrMargin,
    qrTitle,
    qrLevel,
    qrImageSrc,
    qrImageX,
    qrImageY,
    qrImageHeight,
    qrImageWidth,
    qrImageOpacity,
    qrImageExcavate,
    tabIndex,
    allowDownload
}: BarcodeGeneratorContainerProps): ReactElement {
    const svgRef = useRef<SVGSVGElement>(null);
    const qrContainerRef = useRef<HTMLDivElement>(null);

    const value = codeValue?.status === "available" ? codeValue.value : "";
    const width = codeWidth ?? 128;
    const height = codeHeight ?? 128;
    const format = codeFormat === "Custom" ? (customCodeFormat ?? "CODE128") : (codeFormat ?? "CODE128");
    const margin = codeMargin ?? 2;
    const showValue = displayValue ?? false;
    const download = allowDownload ?? false;
    const qrsize = qrSize ?? 128;
    const qrmargin = qrMargin ?? 2;
    const qrtitle = qrTitle ?? "";
    const qrlevel = qrLevel ?? "L";
    const qrimageSrc = qrImageSrc?.status === "available" && qrImageSrc.value ? qrImageSrc.value.uri : "";
    const qrimageX = qrImageX === 0 ? undefined : qrImageX;
    const qrimageY = qrImageY === 0 ? undefined : qrImageY;
    const qrimageHeight = qrImageHeight ?? 24;
    const qrimageWidth = qrImageWidth ?? 24;
    const qrimageOpacity = qrImageOpacity?.toNumber() ?? 1;
    const qrimageExcavate = qrImageExcavate ?? true;

    const { downloadSVG } = useDownload({ format, svgRef, qrContainerRef });

    if (!value) {
        return <span>No barcode value provided</span>;
    }

    return (
        <div className="barcode-generator" tabIndex={tabIndex}>
            <CodeRenderer
                value={value}
                format={format}
                width={width}
                height={height}
                margin={margin}
                displayValue={showValue}
                qrsize={qrsize}
                qrmargin={qrmargin}
                qrlevel={qrlevel}
                qrtitle={qrtitle}
                qrimageSrc={qrimageSrc}
                qrimageX={qrimageX}
                qrimageY={qrimageY}
                qrimageWidth={qrimageWidth}
                qrimageHeight={qrimageHeight}
                qrimageOpacity={qrimageOpacity}
                qrimageExcavate={qrimageExcavate}
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
