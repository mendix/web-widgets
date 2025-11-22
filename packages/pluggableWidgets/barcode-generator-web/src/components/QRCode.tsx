import { QRCodeSVG } from "qrcode.react";
import { Fragment, useRef } from "react";
import { useDownloadQrCode } from "../hooks/useDownloadQRCode";
import { useBarcodeConfig } from "../config/BarcodeContext";

export const QRCodeRenderer = () => {
    const ref = useRef<SVGSVGElement>(null);
    const { downloadQrCode } = useDownloadQrCode({ ref });

    const {
        value,
        allowDownload,
        qrSize: size,
        qrMargin: margin,
        qrTitle: title,
        qrLevel: level,
        qrImageSrc: imageSrc,
        qrImageX: imageX,
        qrImageY: imageY,
        qrImageHeight: imageHeight,
        qrImageWidth: imageWidth,
        qrImageOpacity: imageOpacity,
        qrImageExcavate: imageExcavate
    } = useBarcodeConfig();
    const imageSettings = imageSrc
        ? {
              src: imageSrc,
              x: imageX,
              y: imageY,
              height: imageHeight,
              width: imageWidth,
              opacity: imageOpacity,
              excavate: imageExcavate
          }
        : undefined;

    return (
        <Fragment>
            <QRCodeSVG
                ref={ref}
                value={value}
                size={size}
                level={level.toUpperCase() as "L" | "M" | "Q" | "H"}
                marginSize={margin}
                title={title}
                imageSettings={imageSettings}
            />
            {allowDownload && (
                <button type="button" onClick={downloadQrCode} className="btn btn-default">
                    Download QR Code
                </button>
            )}
        </Fragment>
    );
};
