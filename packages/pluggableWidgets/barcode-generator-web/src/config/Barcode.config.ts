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
    fileName?: string;
    buttonPosition: "top" | "bottom";
}

export interface CodeBaseTypeConfig extends Pick<BarcodeGeneratorContainerProps, "logLevel"> {
    codeValue: string;
    margin: number;
    downloadButton?: DownloadButtonConfig;
}

/** Configuration for barcode (non-QR) rendering */
export interface BarcodeTypeConfig extends CodeBaseTypeConfig {
    type: "barcode";
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
export interface QRCodeTypeConfig extends CodeBaseTypeConfig {
    type: "qrcode";
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
              fileName: getFileName(props.downloadFileName?.value),
              buttonPosition: props.buttonPosition ?? "bottom"
          }
        : undefined;

    const baseConfig: CodeBaseTypeConfig = {
        codeValue,
        margin: (format === "QRCode" ? props.qrMargin : props.codeMargin) ?? 2,
        logLevel: props.logLevel,
        downloadButton: downloadButtonConfig
    };

    if (format === "QRCode") {
        return {
            type: "qrcode",
            ...baseConfig,
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
        type: "barcode",
        ...baseConfig,
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

function getFileName(customFileName: string | undefined): string | undefined {
    // Use custom filename if provided
    if (customFileName && customFileName.trim()) {
        return customFileName.trim().endsWith(".png") ? customFileName.trim() : `${customFileName.trim()}.png`;
    }

    return undefined; // Let the download function generate a default filename based on content and timestamp
}
