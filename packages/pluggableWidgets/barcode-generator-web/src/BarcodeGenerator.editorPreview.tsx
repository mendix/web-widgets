import classNames from "classnames";
import { type CSSProperties, ReactElement, useState } from "react";
import { parseStyle } from "@mendix/widget-plugin-platform/preview/parse-style";
import { BarcodeGeneratorPreviewProps } from "../typings/BarcodeGeneratorProps";
import { DownloadIcon } from "./components/icons/DownloadIcon";
import BarcodePreviewSVG from "./assets/BarcodeGeneratorPreview.svg";

const defaultDownloadCaption = "Download";
const qrImagePlaceholder =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'>" +
    "<rect width='80' height='80' fill='%23e6e6e6'/>" +
    "<path d='M16 56 L64 24' stroke='%23999999' stroke-width='6'/>" +
    "<path d='M16 24 L64 56' stroke='%23999999' stroke-width='6'/>" +
    "</svg>";

function PreviewDownloadButton(props: BarcodeGeneratorPreviewProps): ReactElement | null {
    if (!props.allowDownload) {
        return null;
    }

    return (
        <a className="mx-link" role="button" aria-label={props.downloadButtonAriaLabel || undefined} tabIndex={0}>
            <DownloadIcon /> {props.downloadButtonCaption || defaultDownloadCaption}
        </a>
    );
}

function PreviewQrCode(props: BarcodeGeneratorPreviewProps): ReactElement {
    const doc = decodeURI(BarcodePreviewSVG);
    const downloadButton = <PreviewDownloadButton {...props} />;
    const qrSize = props.qrSize ?? 128;
    // Note: qrMargin is in module units (QR grid cells), not pixels
    // The QRCodeSVG component handles margin internally within the specified size
    const displaySize = Math.min(qrSize, 400); // Clamped to 400px for preview
    const qrImageWidth = props.qrImageWidth ?? 32;
    const qrImageHeight = props.qrImageHeight ?? 32;
    const qrImageOpacity = props.qrImageOpacity ?? 1;
    const qrImageX = props.qrImageX ?? 0;
    const qrImageY = props.qrImageY ?? 0;

    const [imageSrcError, setImageSrcError] = useState<boolean>(false);

    // Resolve the actual image URL from user config
    const resolveImageSrc = (): string => {
        if (!props.qrImageSrc) {
            return qrImagePlaceholder;
        }

        if (imageSrcError) {
            return qrImagePlaceholder;
        }

        // Static image URL
        if (props.qrImageSrc.type === "static") {
            return props.qrImageSrc.imageUrl;
        }

        // Dynamic image (from data entity) - not directly resolvable in preview
        // Fall back to placeholder
        return qrImagePlaceholder;
    };

    const imageBaseStyle: CSSProperties = props.qrImageCenter
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
            {props.qrTitle && <h3 className="qrcode-renderer-title">{props.qrTitle}</h3>}
            {props.buttonPosition === "top" && downloadButton}
            <div className="barcode-preview-qr-container" style={{ width: displaySize, height: displaySize }}>
                <img
                    className="barcode-preview-graphic barcode-preview-graphic--qr"
                    src={doc}
                    alt=""
                    style={{ width: displaySize, height: displaySize }}
                />
                {props.qrImage && (
                    <>
                        {props.qrImageExcavate && (
                            <div
                                className="barcode-preview-qr-image-excavate"
                                style={imageBaseStyle}
                                aria-hidden="true"
                            />
                        )}
                        <img
                            className="barcode-preview-qr-image"
                            src={resolveImageSrc()}
                            alt=""
                            onError={() => setImageSrcError(true)}
                            style={{ ...imageBaseStyle, opacity: qrImageOpacity }}
                        />
                    </>
                )}
            </div>
            {props.buttonPosition === "bottom" && downloadButton}
        </div>
    );
}

function PreviewBarcode(props: BarcodeGeneratorPreviewProps): ReactElement {
    const downloadButton = <PreviewDownloadButton {...props} />;
    const codeHeight = props.codeHeight ?? 200;
    const displayHeight = Math.min(codeHeight, 400); // Clamped to 400px for preview

    return (
        <div className="barcode-renderer">
            {props.buttonPosition === "top" && downloadButton}
            <svg
                className="barcode-preview-graphic barcode-preview-graphic--barcode"
                viewBox="0 0 220 80"
                role="img"
                style={{ height: displayHeight }}
            >
                <rect x="0" y="0" width="220" height="80" fill="#ffffff" />
                <rect x="8" y="8" width="6" height="64" fill="#1b1b1b" />
                <rect x="18" y="8" width="2" height="64" fill="#1b1b1b" />
                <rect x="24" y="8" width="5" height="64" fill="#1b1b1b" />
                <rect x="34" y="8" width="3" height="64" fill="#1b1b1b" />
                <rect x="42" y="8" width="7" height="64" fill="#1b1b1b" />
                <rect x="53" y="8" width="2" height="64" fill="#1b1b1b" />
                <rect x="59" y="8" width="6" height="64" fill="#1b1b1b" />
                <rect x="69" y="8" width="3" height="64" fill="#1b1b1b" />
                <rect x="76" y="8" width="7" height="64" fill="#1b1b1b" />
                <rect x="87" y="8" width="2" height="64" fill="#1b1b1b" />
                <rect x="93" y="8" width="6" height="64" fill="#1b1b1b" />
                <rect x="103" y="8" width="3" height="64" fill="#1b1b1b" />
                <rect x="110" y="8" width="7" height="64" fill="#1b1b1b" />
                <rect x="121" y="8" width="2" height="64" fill="#1b1b1b" />
                <rect x="127" y="8" width="6" height="64" fill="#1b1b1b" />
                <rect x="137" y="8" width="3" height="64" fill="#1b1b1b" />
                <rect x="144" y="8" width="7" height="64" fill="#1b1b1b" />
                <rect x="155" y="8" width="2" height="64" fill="#1b1b1b" />
                <rect x="161" y="8" width="6" height="64" fill="#1b1b1b" />
                <rect x="171" y="8" width="3" height="64" fill="#1b1b1b" />
                <rect x="178" y="8" width="7" height="64" fill="#1b1b1b" />
                <rect x="189" y="8" width="2" height="64" fill="#1b1b1b" />
                <rect x="195" y="8" width="6" height="64" fill="#1b1b1b" />
            </svg>
            {props.buttonPosition === "bottom" && downloadButton}
        </div>
    );
}

export function preview(props: BarcodeGeneratorPreviewProps): ReactElement {
    const styles = parseStyle(props.style);
    const isQrCode = props.codeFormat === "QRCode";

    return (
        <div
            className={classNames(
                props.class,
                props.className,
                "barcode-generator",
                { "barcode-generator--as-card": props.showAsCard },
                "barcode-generator-widget-preview"
            )}
            style={styles}
        >
            {isQrCode ? <PreviewQrCode {...props} /> : <PreviewBarcode {...props} />}
        </div>
    );
}

export function getPreviewCss(): string {
    return require("./ui/BarcodeGeneratorPreview.scss");
}
