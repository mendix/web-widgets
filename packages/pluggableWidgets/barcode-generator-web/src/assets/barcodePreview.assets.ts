// Import all barcode SVG files
import code128Svg from "./barcodes/code128.svg";
import ean13Svg from "./barcodes/ean13.svg";
import ean13Ean2Svg from "./barcodes/ean13-ean2.svg";
import ean13Ean5Svg from "./barcodes/ean13-ean5.svg";
import ean13FlatSvg from "./barcodes/ean13-flat.svg";
import ean8Svg from "./barcodes/ean8.svg";
import ean8Ean2Svg from "./barcodes/ean8-ean2.svg";
import ean8Ean5Svg from "./barcodes/ean8-ean5.svg";
import ean8FlatSvg from "./barcodes/ean8-flat.svg";
import upcSvg from "./barcodes/upc.svg";
import upcEan2Svg from "./barcodes/upc-ean2.svg";
import upcEan5Svg from "./barcodes/upc-ean5.svg";
import code39Svg from "./barcodes/code39.svg";
import itf14Svg from "./barcodes/itf14.svg";
import msiSvg from "./barcodes/msi.svg";
import pharmacodeSvg from "./barcodes/pharmacode.svg";
import codabarSvg from "./barcodes/codabar.svg";
import code93Svg from "./barcodes/code93.svg";

type BarcodeImageVariants = {
    default: string;
    flat?: string;
    EAN2?: string;
    EAN5?: string;
};

const barcodeImageMap: Record<string, BarcodeImageVariants> = {
    CODE128: { default: code128Svg },
    EAN13: {
        default: ean13Svg,
        EAN2: ean13Ean2Svg,
        EAN5: ean13Ean5Svg,
        flat: ean13FlatSvg
    },
    EAN8: {
        default: ean8Svg,
        EAN2: ean8Ean2Svg,
        EAN5: ean8Ean5Svg,
        flat: ean8FlatSvg
    },
    UPC: {
        default: upcSvg,
        EAN2: upcEan2Svg,
        EAN5: upcEan5Svg
    },
    CODE39: { default: code39Svg },
    ITF14: { default: itf14Svg },
    MSI: { default: msiSvg },
    pharmacode: { default: pharmacodeSvg },
    codabar: { default: codabarSvg },
    CODE93: { default: code93Svg }
};

export function getBarcodeImageUrl(
    codeFormat: string,
    customCodeFormat: string,
    addonFormat: string,
    enableFlat: boolean
): string | null {
    const format = codeFormat === "Custom" ? customCodeFormat : codeFormat;
    const formatMap = barcodeImageMap[format];

    if (!formatMap) return null;

    if (enableFlat && (format === "EAN13" || format === "EAN8")) {
        return formatMap.flat || formatMap.default;
    }

    if (addonFormat && addonFormat !== "None" && (format === "EAN13" || format === "EAN8" || format === "UPC")) {
        if (addonFormat === "EAN2") {
            return formatMap.EAN2 || formatMap.default;
        }
        if (addonFormat === "EAN5") {
            return formatMap.EAN5 || formatMap.default;
        }
    }

    return formatMap.default || null;
}
