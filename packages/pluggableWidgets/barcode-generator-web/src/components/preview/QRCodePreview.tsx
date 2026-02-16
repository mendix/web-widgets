import { type CSSProperties, ReactElement, useState } from "react";
import { BarcodeGeneratorPreviewProps } from "../../../typings/BarcodeGeneratorProps";
import BarcodePreviewSVG from "../../assets/BarcodeGeneratorPreview.svg";
import { resolveQRImageSrc } from "../../utils/qrcode-preview-utils";

interface QRCodePreviewProps extends BarcodeGeneratorPreviewProps {
    downloadButton: ReactElement | null;
}

export function QRCodePreview(props: QRCodePreviewProps): ReactElement {
    const { downloadButton, ...restProps } = props;
    const doc = decodeURI(BarcodePreviewSVG);
    const qrSize = restProps.qrSize ?? 128;
    // Note: qrMargin is in module units (QR grid cells), not pixels
    // The QRCodeSVG component handles margin internally within the specified size
    const displaySize = Math.min(qrSize, 400); // Clamped to 400px for preview
    const qrImageWidth = restProps.qrImageWidth ?? 32;
    const qrImageHeight = restProps.qrImageHeight ?? 32;
    const qrImageOpacity = restProps.qrImageOpacity ?? 1;
    const qrImageX = restProps.qrImageX ?? 0;
    const qrImageY = restProps.qrImageY ?? 0;

    const [imageSrcError, setImageSrcError] = useState<boolean>(false);

    const imageBaseStyle: CSSProperties = restProps.qrImageCenter
        ? {
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: qrImageWidth,
              height: qrImageHeight
          }
        : {
              left: qrImageX,
              top: qrImageY,
              width: qrImageWidth,
              height: qrImageHeight
          };

    return (
        <div className="qrcode-renderer">
            {restProps.qrTitle && <h3 className="qrcode-renderer-title">{restProps.qrTitle}</h3>}
            {restProps.buttonPosition === "top" && downloadButton}
            <div className="barcode-preview-qr-container" style={{ width: displaySize, height: displaySize }}>
                <img
                    className="barcode-preview-graphic barcode-preview-graphic--qr"
                    src={doc}
                    alt=""
                    style={{ width: displaySize, height: displaySize }}
                />
                {restProps.qrImage && (
                    <>
                        {restProps.qrImageExcavate && (
                            <div
                                className="barcode-preview-qr-image-excavate"
                                style={imageBaseStyle}
                                aria-hidden="true"
                            />
                        )}
                        <img
                            className="barcode-preview-qr-image"
                            src={resolveQRImageSrc(restProps.qrImageSrc, imageSrcError)}
                            alt=""
                            onError={() => setImageSrcError(true)}
                            style={{ ...imageBaseStyle, opacity: qrImageOpacity }}
                        />
                    </>
                )}
            </div>
            {restProps.buttonPosition === "bottom" && downloadButton}
        </div>
    );
}
