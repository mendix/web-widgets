import { QRCodeSVG } from "qrcode.react";
import { ReactElement, useRef } from "react";
import { downloadCode } from "../utils/download-code";
import { DownloadIcon } from "./icons/DownloadIcon";
import { QRCodeTypeConfig } from "../config/Barcode.config";

interface QRCodeRendererProps {
    config: QRCodeTypeConfig;
}

export function QRCodeRenderer({ config }: QRCodeRendererProps): ReactElement {
    const ref = useRef<SVGSVGElement>(null);

    const { codeValue, downloadButton, size, margin, title, level, image } = config;
    const buttonPosition = downloadButton?.buttonPosition ?? "bottom";

    const button = downloadButton && (
        <a
            className="mx-link"
            role="button"
            aria-label={downloadButton.label}
            tabIndex={0}
            onClick={() => downloadCode(ref, config.type, downloadButton.fileName)}
        >
            <DownloadIcon /> {downloadButton.caption}
        </a>
    );

    return (
        <div className="qrcode-renderer">
            {title && <h3 className="qrcode-renderer-title">{title}</h3>}
            {buttonPosition === "top" && button}
            <QRCodeSVG
                ref={ref}
                value={codeValue}
                size={size}
                level={level}
                marginSize={margin}
                title={title}
                imageSettings={image}
            />
            {buttonPosition === "bottom" && button}
        </div>
    );
}
