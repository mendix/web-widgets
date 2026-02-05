import { RefObject } from "react";
import { downloadBlob, FILENAMES, prepareSvgForDownload, processQRImages } from "./download-utils";

type SvgType = "barcode" | "qrcode";

/**
 * Downloads an SVG element as a file
 * @param svgElement - The SVG element to download
 * @param type - The type of SVG (barcode or qrcode)
 */
export async function downloadSvg(svgElement: SVGSVGElement, type: SvgType): Promise<void> {
    try {
        const clonedSvg = prepareSvgForDownload(svgElement);

        // Process overlay images for QR codes
        if (type === "qrcode") {
            await processQRImages(clonedSvg);
        }

        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(clonedSvg);

        // Create download blob and trigger download
        const blobOptions = {
            type: "image/svg+xml;charset=utf-8",
            lastModified: Date.now()
        };
        const blob = new Blob([svgString], blobOptions);
        const filename = type === "qrcode" ? FILENAMES.QRCode : FILENAMES.Barcode;
        downloadBlob(blob, filename);
    } catch (error) {
        console.error(`Error downloading ${type}:`, error);
    }
}

/**
 * Helper function to download a barcode SVG from a ref
 */
export function downloadBarcodeFromRef(ref: RefObject<SVGSVGElement | null>): Promise<void> {
    const svgElement = ref.current;
    if (!svgElement) {
        console.error("SVG element not found for download");
        return Promise.resolve();
    }
    return downloadSvg(svgElement, "barcode");
}

/**
 * Helper function to download a QR code SVG from a ref
 */
export function downloadQrCodeFromRef(ref: RefObject<SVGSVGElement | null>): Promise<void> {
    const svgElement = ref.current;
    if (!svgElement) {
        console.error("SVG element not found for download");
        return Promise.resolve();
    }
    return downloadSvg(svgElement, "qrcode");
}
