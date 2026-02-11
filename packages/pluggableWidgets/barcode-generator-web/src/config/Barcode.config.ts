import { BarcodeGeneratorContainerProps, QrLevelEnum } from "../../typings/BarcodeGeneratorProps";

interface DownloadButtonConfig {
    caption?: string;
    label?: string;
    fileName: string;
}

/** Configuration for barcode (non-QR) rendering */
export interface BarcodeTypeConfig {
    type: "barcode";
    codeValue: string;
    width: number;
    height: number;
    format: string;
    margin: number;
    displayValue: boolean;
    buttonPosition: "top" | "bottom";
    downloadButton?: DownloadButtonConfig;

    // Advanced barcode options
    enableEan128: boolean;
    enableFlat: boolean;
    lastChar: string;
    enableMod43: boolean;
    addonValue: string;
    addonFormat: string;
    addonSpacing: number;
}

/** Configuration for QR code rendering */
export interface QRCodeTypeConfig {
    type: "qrcode";
    codeValue: string;
    size: number;
    margin: number;
    title: string;
    level: QrLevelEnum;
    buttonPosition: "top" | "bottom";
    downloadButton?: DownloadButtonConfig;
    image?: {
        src: string;
        x: number | undefined;
        y: number | undefined;
        height: number;
        width: number;
        opacity: number;
        excavate: boolean;
    };
}

export type BarcodeConfig = BarcodeTypeConfig | QRCodeTypeConfig;

export function barcodeConfig(props: BarcodeGeneratorContainerProps): BarcodeConfig {
    const codeValue = props.codeValue?.value ?? "";
    const format = props.codeFormat === "Custom" ? props.customCodeFormat : props.codeFormat;

    const downloadButtonConfig = props.allowDownload
        ? {
              caption: props.downloadButtonCaption?.value,
              label: props.downloadButtonAriaLabel?.value,
              fileName: format === "QRCode" ? `qrcode_${hashCode(codeValue)}.png` : `barcode_${hashCode(codeValue)}.png`
          }
        : undefined;

    if (format === "QRCode") {
        return {
            type: "qrcode",
            codeValue,
            size: props.qrSize ?? 128,
            margin: props.qrMargin ?? 2,
            title: props.qrTitle ?? "",
            level: props.qrLevel ?? "L",
            buttonPosition: props.buttonPosition ?? "bottom",
            downloadButton: downloadButtonConfig,
            image:
                props.qrImageSrc?.status === "available"
                    ? {
                          src: props.qrImageSrc.value.uri,
                          x: props.qrImageX === 0 ? undefined : props.qrImageX,
                          y: props.qrImageY === 0 ? undefined : props.qrImageY,
                          height: props.qrImageHeight ?? 24,
                          width: props.qrImageWidth ?? 24,
                          opacity: props.qrImageOpacity?.toNumber() ?? 1,
                          excavate: props.qrImageExcavate ?? true
                      }
                    : undefined
        };
    }

    return {
        type: "barcode",
        codeValue,
        width: props.codeWidth ?? 128,
        height: props.codeHeight ?? 128,
        format,
        margin: props.codeMargin ?? 2,
        displayValue: props.displayValue ?? false,
        buttonPosition: props.buttonPosition ?? "bottom",
        downloadButton: downloadButtonConfig,

        // Advanced barcode options
        enableEan128: props.enableEan128 ?? false,
        enableFlat: props.enableFlat ?? false,
        lastChar: props.lastChar ?? "",
        enableMod43: props.enableMod43 ?? false,
        addonValue: props.addonValue?.status === "available" ? (props.addonValue.value ?? "") : "",
        addonFormat: props.addonFormat,
        addonSpacing: props.addonSpacing ?? 20
    };
}

function hashCode(s: string): string {
    if (!s) {
        return "empty";
    }

    let hash = 0;
    for (let i = 0; i < s.length; i++) {
        const char = s.charCodeAt(i);
        // eslint-disable-next-line no-bitwise
        hash = (hash << 5) - hash + char;
        // eslint-disable-next-line no-bitwise
        hash = hash & hash; // Convert to 32-bit integer
    }

    // Convert to base36 and take first 10 characters
    return Math.abs(hash).toString(36).substring(0, 10);
}
