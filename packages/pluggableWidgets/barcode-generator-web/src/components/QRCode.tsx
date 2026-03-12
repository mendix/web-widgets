import { QRCodeSVG } from "qrcode.react";
import { ReactElement, useRef } from "react";
import { downloadCode } from "../utils/download-code";
import { DownloadButton } from "./DownloadButton";
import { QRCodeTypeConfig } from "../config/Barcode.config";

interface QRCodeRendererProps {
    config: QRCodeTypeConfig;
}

export function QRCodeRenderer({ config }: QRCodeRendererProps): ReactElement {
    const ref = useRef<SVGSVGElement>(null);

    const { codeValue, downloadButton, size, margin, title, level, overlay } = config;
    const buttonPosition = downloadButton?.buttonPosition ?? "bottom";

    const button = downloadButton && (
        <DownloadButton
            onClick={() => downloadCode(ref, config.type, downloadButton.fileName)}
            ariaLabel={downloadButton.label}
            caption={downloadButton.caption}
        />
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
                imageSettings={overlay}
            />
            {buttonPosition === "bottom" && button}
        </div>
    );
}
