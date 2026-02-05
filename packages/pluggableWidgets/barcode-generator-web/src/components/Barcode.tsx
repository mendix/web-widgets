import { useRenderBarcode } from "../hooks/useRenderBarcode";
import { downloadBarcodeFromRef } from "../utils/download-svg";
import { BarcodeTypeConfig } from "../config/Barcode.config";

import { Fragment, ReactElement } from "react";

interface BarcodeRendererProps {
    config: BarcodeTypeConfig;
}

export function BarcodeRenderer({ config }: BarcodeRendererProps): ReactElement {
    const ref = useRenderBarcode(config);
    const { allowDownload, downloadAriaLabel } = config;

    return (
        <Fragment>
            <svg ref={ref} />
            {allowDownload && (
                <button
                    className="btn btn-default"
                    aria-label={downloadAriaLabel}
                    onClick={() => downloadBarcodeFromRef(ref)}
                >
                    Download barcode
                </button>
            )}
        </Fragment>
    );
}
