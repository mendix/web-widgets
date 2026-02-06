import { useRenderBarcode } from "../hooks/useRenderBarcode";
import { downloadBarcodeFromRef } from "../utils/download-svg";
import { BarcodeTypeConfig } from "../config/Barcode.config";

import { Fragment, ReactElement } from "react";

interface BarcodeRendererProps {
    config: BarcodeTypeConfig;
}

export function BarcodeRenderer({ config }: BarcodeRendererProps): ReactElement {
    const ref = useRenderBarcode(config);
    const { downloadButton } = config;

    return (
        <Fragment>
            <svg ref={ref} />
            {downloadButton && (
                <button
                    className="btn btn-default"
                    aria-label={downloadButton.label}
                    onClick={() => downloadBarcodeFromRef(ref, downloadButton.fileName)}
                >
                    {downloadButton.caption}
                </button>
            )}
        </Fragment>
    );
}
