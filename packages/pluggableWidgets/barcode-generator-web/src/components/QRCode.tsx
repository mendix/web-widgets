import { QRCodeSVG } from "qrcode.react";
import { Fragment, ReactElement, useRef } from "react";
import { downloadQrCodeFromRef } from "../utils/download-svg";
import { QRCodeTypeConfig } from "../config/Barcode.config";

interface QRCodeRendererProps {
    config: QRCodeTypeConfig;
}

export function QRCodeRenderer({ config }: QRCodeRendererProps): ReactElement {
    const ref = useRef<SVGSVGElement>(null);

    const { codeValue, downloadButton, size, margin, title, level, image } = config;

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
            {downloadButton && (
                <button
                    type="button"
                    aria-label={downloadButton.label}
                    onClick={() => downloadQrCodeFromRef(ref, downloadButton.fileName)}
                    className="btn btn-default"
                >
                    {downloadButton.caption}
                </button>
            )}
        </Fragment>
    );
}
