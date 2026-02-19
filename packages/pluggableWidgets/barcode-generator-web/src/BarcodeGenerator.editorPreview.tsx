import classNames from "classnames";
import { ReactElement } from "react";
import { parseStyle } from "@mendix/widget-plugin-platform/preview/parse-style";
import { BarcodeGeneratorPreviewProps } from "../typings/BarcodeGeneratorProps";
import { DownloadIcon } from "./components/icons/DownloadIcon";
import { BarcodePreview } from "./components/preview/BarcodePreview";
import { QRCodePreview } from "./components/preview/QRCodePreview";

const defaultDownloadCaption = "Download";

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

export function preview(props: BarcodeGeneratorPreviewProps): ReactElement {
    const styles = parseStyle(props.style);
    const isQrCode = props.codeFormat === "QRCode";
    const downloadButton = <PreviewDownloadButton {...props} />;

    return (
        <div
            className={classNames(props.class, props.className, "barcode-generator", {
                "barcode-generator--as-card": props.showAsCard
            })}
            style={styles}
        >
            {isQrCode ? (
                <QRCodePreview {...props} downloadButton={downloadButton} />
            ) : (
                <BarcodePreview {...props} downloadButton={downloadButton} />
            )}
        </div>
    );
}

export function getPreviewCss(): string {
    return require("./ui/BarcodeGenerator.scss");
}
