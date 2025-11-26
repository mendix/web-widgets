import { BarcodeGeneratorContainerProps } from "../../typings/BarcodeGeneratorProps";

/** Configuration for static values that don't change at runtime. */
export interface BarcodeConfig {
    // Basic barcode properties
    value: string;
    width: number;
    height: number;
    format: string;
    isQRCode: boolean;
    margin: number;
    displayValue: boolean;
    allowDownload: boolean;
    downloadAriaLabel?: string;

    // Advanced barcode options
    enableEan128: boolean;
    enableFlat: boolean;
    lastChar: string;
    enableMod43: boolean;
    addonValue: string;
    addonFormat: string;
    addonSpacing: number;

    // QR Code properties
    qrSize: number;
    qrMargin: number;
    qrTitle: string;
    qrLevel: string;
    qrImageSrc: string;
    qrImageX: number | undefined;
    qrImageY: number | undefined;
    qrImageHeight: number;
    qrImageWidth: number;
    qrImageOpacity: number;
    qrImageExcavate: boolean;
}

export function barcodeConfig(props: BarcodeGeneratorContainerProps): BarcodeConfig {
    const value = props.codeValue?.status === "available" ? (props.codeValue.value ?? "") : "";
    const format =
        props.codeFormat === "Custom" ? (props.customCodeFormat ?? "CODE128") : (props.codeFormat ?? "CODE128");
    const isQRCode = format === "QRCode";

    return Object.freeze({
        // Basic barcode properties
        value,
        width: props.codeWidth ?? 128,
        height: props.codeHeight ?? 128,
        format,
        isQRCode,
        margin: props.codeMargin ?? 2,
        displayValue: props.displayValue ?? false,
        allowDownload: props.allowDownload ?? false,
        downloadAriaLabel: props.downloadAriaLabel,

        // Advanced barcode options
        enableEan128: props.enableEan128 ?? false,
        enableFlat: props.enableFlat ?? false,
        lastChar: props.lastChar ?? "",
        enableMod43: props.enableMod43 ?? false,
        addonValue: props.addonValue?.status === "available" ? (props.addonValue.value ?? "") : "",
        addonFormat: props.addonFormat,
        addonSpacing: props.addonSpacing ?? 20,

        // QR Code properties
        qrSize: props.qrSize ?? 128,
        qrMargin: props.qrMargin ?? 2,
        qrTitle: props.qrTitle ?? "",
        qrLevel: props.qrLevel ?? "L",
        qrImageSrc:
            props.qrImageSrc?.status === "available" && props.qrImageSrc.value ? props.qrImageSrc.value.uri : "",
        qrImageX: props.qrImageX === 0 ? undefined : props.qrImageX,
        qrImageY: props.qrImageY === 0 ? undefined : props.qrImageY,
        qrImageHeight: props.qrImageHeight ?? 24,
        qrImageWidth: props.qrImageWidth ?? 24,
        qrImageOpacity: props.qrImageOpacity?.toNumber() ?? 1,
        qrImageExcavate: props.qrImageExcavate ?? true
    });
}
