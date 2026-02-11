import { useRenderBarcode } from "../hooks/useRenderBarcode";
import { downloadCode } from "../utils/download-code";
import { BarcodeTypeConfig } from "../config/Barcode.config";
import { DownloadIcon } from "./icons/DownloadIcon";

import { ReactElement } from "react";

interface BarcodeRendererProps {
    config: BarcodeTypeConfig;
}

export function BarcodeRenderer({ config }: BarcodeRendererProps): ReactElement {
    const ref = useRenderBarcode(config);
    const { downloadButton, buttonPosition } = config;

    const button = downloadButton && (
        <a
            className="mx-link"
            role="button"
            aria-label={downloadButton.label}
            tabIndex={0}
            onClick={() => downloadCode(ref, config.type, downloadButton.fileName)}
        >
            <DownloadIcon /> {downloadButton.caption}
        </a>
    );

    return (
        <div className="barcode-renderer">
            {buttonPosition === "top" && button}
            <svg ref={ref} />
            {buttonPosition === "bottom" && button}
        </div>
    );
}
