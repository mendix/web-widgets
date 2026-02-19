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
    const qrOverlayWidth = restProps.qrOverlayWidth ?? 32;
    const qrOverlayHeight = restProps.qrOverlayHeight ?? 32;
    const qrOverlayOpacity = restProps.qrOverlayOpacity ?? 1;
    const qrOverlayX = restProps.qrOverlayX ?? 0;
    const qrOverlayY = restProps.qrOverlayY ?? 0;

    const [imageSrcError, setImageSrcError] = useState<boolean>(false);

    const imageBaseStyle: CSSProperties = restProps.qrOverlayCenter
        ? {
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: qrOverlayWidth,
              height: qrOverlayHeight
          }
        : {
              left: qrOverlayX,
              top: qrOverlayY,
              width: qrOverlayWidth,
              height: qrOverlayHeight
          };

    return (
        <div className="qrcode-renderer">
            {restProps.qrTitle && <h3 className="qrcode-renderer-title">{restProps.qrTitle}</h3>}
            {restProps.buttonPosition === "top" && downloadButton}
            <img
                className="qrcode-preview-image"
                src={doc}
                alt=""
                style={{ width: displaySize, height: displaySize }}
            />
            {restProps.qrOverlay && (
                <img
                    className="qrcode-preview-overlay"
                    src={resolveQRImageSrc(restProps.qrOverlaySrc, imageSrcError)}
                    alt=""
                    onError={() => setImageSrcError(true)}
                    style={{
                        ...imageBaseStyle,
                        opacity: qrOverlayOpacity,
                        ...(restProps.qrOverlayExcavate && {
                            backgroundColor: "#ffffff",
                            outline: "3px solid #ffffff"
                        })
                    }}
                />
            )}
            {restProps.buttonPosition === "bottom" && downloadButton}
        </div>
    );
}
