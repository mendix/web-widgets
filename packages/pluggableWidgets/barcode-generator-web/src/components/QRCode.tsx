import { QRCodeSVG } from "qrcode.react";
import { forwardRef, ReactElement, useRef } from "react";
import { QRCodeTypeConfig } from "../config/Barcode.config";
import { downloadCode } from "../utils/download-code";
import { DownloadButton } from "./DownloadButton";

interface QRCodeRendererProps {
    config: QRCodeTypeConfig;
}
interface QRCodeSVGWrapperProps {
    value: string;
    size?: number;
    level?: string;
    marginSize?: number;
    title?: string;
    imageSettings?: any;
}

const QRCodeSVGWrapper = forwardRef<SVGSVGElement, QRCodeSVGWrapperProps>(
    ({ value, size, level, marginSize, title, imageSettings }, ref) => (
        <QRCodeSVG
            ref={ref as any}
            value={value}
            size={size}
            level={level as any}
            marginSize={marginSize}
            title={title}
            imageSettings={imageSettings}
        />
    )
);
QRCodeSVGWrapper.displayName = "QRCodeSVGWrapper";

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
            {config.showTitle && <h3 className="qrcode-renderer-title">{title}</h3>}
            {buttonPosition === "top" && button}
            <QRCodeSVGWrapper
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
