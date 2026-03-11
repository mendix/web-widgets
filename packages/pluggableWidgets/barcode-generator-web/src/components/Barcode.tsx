import { useRenderBarcode } from "../hooks/useRenderBarcode";
import { downloadCode } from "../utils/download-code";
import { BarcodeTypeConfig } from "../config/Barcode.config";
import { DownloadButton } from "./DownloadButton";

import { ReactElement } from "react";

interface BarcodeRendererProps {
    config: BarcodeTypeConfig;
}

export function BarcodeRenderer({ config }: BarcodeRendererProps): ReactElement {
    const { ref, error } = useRenderBarcode(config);
    const { downloadButton } = config;
    const buttonPosition = downloadButton?.buttonPosition ?? "bottom";

    if (error) {
        return (
            <div className="barcode-renderer">
                {config.logLevel !== "None" && (
                    <div className="alert alert-danger" role="alert">
                        <strong>Unable to generate barcode.</strong> Please check the barcode value and format
                        configuration.
                    </div>
                )}
            </div>
        );
    }

    const button = downloadButton && (
        <DownloadButton
            onClick={() => downloadCode(ref, config.type, downloadButton.fileName)}
            ariaLabel={downloadButton.label}
            caption={downloadButton.caption}
        />
    );

    return (
        <div className="barcode-renderer">
            {buttonPosition === "top" && button}
            <svg ref={ref} />
            {buttonPosition === "bottom" && button}
        </div>
    );
}
