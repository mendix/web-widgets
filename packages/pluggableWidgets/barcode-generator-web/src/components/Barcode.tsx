import { useRenderBarcode } from "../hooks/useRenderBarcode";
import { useDownloadBarcode } from "../hooks/useDownloadBarcode";
import { useBarcodeConfig } from "../config/BarcodeContext";

import { Fragment } from "react";

export const BarcodeRenderer = () => {
    const ref = useRenderBarcode();
    const { allowDownload, downloadAriaLabel } = useBarcodeConfig();
    const { downloadBarcode } = useDownloadBarcode({ ref });

    return (
        <Fragment>
            <svg ref={ref} />
            {allowDownload && (
                <button className="btn btn-default" aria-label={downloadAriaLabel} onClick={downloadBarcode}>
                    Download barcode
                </button>
            )}
        </Fragment>
    );
};
