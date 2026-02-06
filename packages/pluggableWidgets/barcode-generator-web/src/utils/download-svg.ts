import { RefObject } from "react";
import { convertSvgToPng, downloadBlob, prepareSvgForDownload, processQRImages } from "./download-utils";

type SvgType = "barcode" | "qrcode";

export async function downloadSvg(svgElement: SVGSVGElement, type: SvgType, fileName: string): Promise<void> {
    try {
        const clonedSvg = prepareSvgForDownload(svgElement);

        // Process overlay images for QR codes
        if (type === "qrcode") {
            await processQRImages(clonedSvg);
        }

        // Convert SVG to PNG with 2x scale for better quality
        const pngBlob = await convertSvgToPng(clonedSvg, 2);

        // Trigger download
        downloadBlob(pngBlob, fileName);
    } catch (error) {
        console.error(`Error downloading ${type}:`, error);
    }
}

/**
 * Helper function to download a barcode SVG from a ref
 */
export function downloadBarcodeFromRef(ref: RefObject<SVGSVGElement | null>, fileName: string): Promise<void> {
    const svgElement = ref.current;
    if (!svgElement) {
        console.error("SVG element not found for download");
        return Promise.resolve();
    }
    return downloadSvg(svgElement, "barcode", fileName);
}

/**
 * Helper function to download a QR code SVG from a ref
 */
export function downloadQrCodeFromRef(ref: RefObject<SVGSVGElement | null>, fileName: string): Promise<void> {
    const svgElement = ref.current;
    if (!svgElement) {
        console.error("SVG element not found for download");
        return Promise.resolve();
    }
    return downloadSvg(svgElement, "qrcode", fileName);
}
