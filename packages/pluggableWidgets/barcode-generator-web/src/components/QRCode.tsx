import { QRCodeSVG } from "qrcode.react";
import { Fragment, ReactElement, useRef } from "react";
import { downloadQrCodeFromRef } from "../utils/download-svg";
import { QRCodeTypeConfig } from "../config/Barcode.config";

interface QRCodeRendererProps {
    config: QRCodeTypeConfig;
}

export function QRCodeRenderer({ config }: QRCodeRendererProps): ReactElement {
    const ref = useRef<SVGSVGElement>(null);

    const { codeValue, allowDownload, size, margin, title, level, downloadAriaLabel, image } = config;

    return (
        <Fragment>
            <QRCodeSVG
                ref={ref}
                value={codeValue}
                size={size}
                level={level}
                marginSize={margin}
                title={title}
                imageSettings={image}
            />
            {allowDownload && (
                <button
                    type="button"
                    aria-label={downloadAriaLabel}
                    onClick={() => downloadQrCodeFromRef(ref)}
                    className="btn btn-default"
                >
                    Download QR Code
                </button>
            )}
        </Fragment>
    );
}
