import { RefObject } from "react";
import { convertSvgToPng, downloadBlob, prepareSvgForDownload, processQRImages } from "./download-utils";
import { BarcodeConfig } from "../config/Barcode.config";

export async function downloadCode(
    ref: RefObject<SVGSVGElement | null>,
    type: BarcodeConfig["type"],
    fileName: string
): Promise<void> {
    try {
        const svgElement = ref.current;
        if (!svgElement) {
            console.error("SVG element not found for download");
            return;
        }

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
