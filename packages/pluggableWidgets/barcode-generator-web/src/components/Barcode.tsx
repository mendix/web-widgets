import { useRenderBarcode } from "../hooks/useRenderBarcode";
import { useDownloadBarcode } from "../hooks/useDownloadBarcode";
import { useBarcodeConfig } from "../config/BarcodeContext";

import { Fragment } from "react";

export const BarcodeRenderer = () => {
    const ref = useRenderBarcode();
    const { allowDownload } = useBarcodeConfig();
    const { downloadBarcode } = useDownloadBarcode({ ref });

    return (
        <Fragment>
            <svg ref={ref} />
            {allowDownload && (
                <button className="btn btn-default" onClick={downloadBarcode}>
                    Download barcode
                </button>
            )}
        </Fragment>
    );
};
