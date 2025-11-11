import { ReactElement, useRef } from "react";
import { useDownload } from "../hooks/useDownload";
import { CodeRenderer } from "./CodeRenderer";
import { useBarcodeConfig } from "../config/BarcodeConfigContext";

interface BarcodeGeneratorInnerProps {
    tabIndex?: number;
}

export function BarcodeGeneratorInner({ tabIndex }: BarcodeGeneratorInnerProps): ReactElement {
    const config = useBarcodeConfig();
    const svgRef = useRef<SVGSVGElement>(null);
    const qrContainerRef = useRef<HTMLDivElement>(null);

    const { downloadSVG } = useDownload({ format: config.format, svgRef, qrContainerRef });

    return (
        <div className="barcode-generator" tabIndex={tabIndex}>
            <CodeRenderer
                value={config.value}
                format={config.format}
                width={config.width}
                height={config.height}
                margin={config.margin}
                displayValue={config.displayValue}
                enableEan128={config.enableEan128}
                enableFlat={config.enableFlat}
                lastChar={config.lastChar}
                enableMod43={config.enableMod43}
                addonValue={config.addonValue}
                addonFormat={config.addonFormat}
                addonSpacing={config.addonSpacing}
                qrsize={config.qrSize}
                qrmargin={config.qrMargin}
                qrlevel={config.qrLevel}
                qrtitle={config.qrTitle}
                qrimageSrc={config.qrImageSrc}
                qrimageX={config.qrImageX}
                qrimageY={config.qrImageY}
                qrimageWidth={config.qrImageWidth}
                qrimageHeight={config.qrImageHeight}
                qrimageOpacity={config.qrImageOpacity}
                qrimageExcavate={config.qrImageExcavate}
                svgRef={svgRef}
                qrContainerRef={qrContainerRef}
            />
            {config.allowDownload && (
                <button type="button" onClick={downloadSVG} className="btn btn-default">
                    Download {config.format === "QRCode" ? "QR Code" : "Barcode"}
                </button>
            )}
        </div>
    );
}
