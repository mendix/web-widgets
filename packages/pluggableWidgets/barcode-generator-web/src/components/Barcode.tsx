import { useRenderBarcode } from "../hooks/useRenderBarcode";
import { downloadCode } from "../utils/download-code";
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
                    onClick={() => downloadCode(ref, config.type, downloadButton.fileName)}
                >
                    {downloadButton.caption}
                </button>
            )}
        </Fragment>
    );
}
