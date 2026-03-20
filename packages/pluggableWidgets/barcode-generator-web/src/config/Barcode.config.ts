import {
    AddonFormatEnum,
    BarcodeGeneratorContainerProps,
    CodeFormatEnum,
    CustomCodeFormatEnum,
    QrLevelEnum
} from "../../typings/BarcodeGeneratorProps";

interface DownloadButtonConfig {
    caption?: string;
    label?: string;
    fileName: string;
    buttonPosition: "top" | "bottom";
}

type CodeType = "barcode" | "qrcode";

export interface CodeBaseTypeConfig<T = CodeType> extends Pick<BarcodeGeneratorContainerProps, "logLevel"> {
    type: T;
    codeValue: string;
    margin: number;
    downloadButton?: DownloadButtonConfig;
}

/** Configuration for barcode (non-QR) rendering */
export interface BarcodeTypeConfig extends CodeBaseTypeConfig<"barcode"> {
    width: number;
    height: number;
    format: CodeFormatEnum | CustomCodeFormatEnum;
    displayValue: boolean;

    // Advanced barcode options
    enableEan128: boolean;
    enableFlat: boolean;
    lastChar: string;
    enableMod43: boolean;
    addonValue: string;
    addonFormat: AddonFormatEnum | null | undefined;
    addonSpacing: number;
}

/** Configuration for QR code rendering */
export interface QRCodeTypeConfig extends CodeBaseTypeConfig<"qrcode"> {
    size: number;
    title: string;
    showTitle: boolean;
    level: QrLevelEnum;
    overlay?: {
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
              fileName: generateFileName(props.downloadFileName?.value, format, codeValue),
              buttonPosition: props.buttonPosition ?? "bottom"
          }
        : undefined;

    const baseConfig: CodeBaseTypeConfig = {
        type: format === "QRCode" ? "qrcode" : "barcode",
        codeValue,
        margin: (format === "QRCode" ? props.qrMargin : props.codeMargin) ?? 2,
        logLevel: props.logLevel,
        downloadButton: downloadButtonConfig
    };

    if (format === "QRCode") {
        return {
            ...baseConfig,
            type: "qrcode",
            size: props.qrSize ?? 128,
            showTitle: props.showTitle,
            title: props.qrTitle.status === "available" ? props.qrTitle.value : "QR Code",
            level: props.qrLevel ?? "L",
            overlay:
                props.qrOverlaySrc?.status === "available"
                    ? {
                          src: props.qrOverlaySrc.value.uri,
                          x: props.qrOverlayX === 0 ? undefined : props.qrOverlayX,
                          y: props.qrOverlayY === 0 ? undefined : props.qrOverlayY,
                          height: props.qrOverlayHeight ?? 24,
                          width: props.qrOverlayWidth ?? 24,
                          opacity: props.qrOverlayOpacity?.toNumber() ?? 1,
                          excavate: props.qrOverlayExcavate ?? true
                      }
                    : undefined
        };
    }

    return {
        ...baseConfig,
        type: "barcode",
        width: props.codeWidth ?? 128,
        height: props.codeHeight ?? 128,
        format,
        displayValue: props.displayValue ?? false,

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

function generateFileName(customFileName: string | undefined, format: string, codeValue: string): string {
    // Use custom filename if provided
    if (customFileName && customFileName.trim()) {
        return customFileName.trim().endsWith(".png") ? customFileName.trim() : `${customFileName.trim()}.png`;
    }

    // Auto-generate filename with format and hash
    const hash = hashCode(codeValue);
    if (format === "QRCode") {
        return `qrcode_${hash}.png`;
    }
    return `barcode_${format}_${hash}.png`;
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
