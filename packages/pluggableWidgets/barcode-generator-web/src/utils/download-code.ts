import { RefObject } from "react";
import {
    convertSvgToPng,
    downloadBlob,
    prepareSvgForDownload,
    processQRImages,
    generateFileName
} from "./download-utils";
import { BarcodeConfig } from "../config/Barcode.config";

export async function downloadCode(
    ref: RefObject<SVGSVGElement | null>,
    config: BarcodeConfig,
    fileName?: string
): Promise<void> {
    try {
        const svgElement = ref.current;
        if (!svgElement) {
            console.error("SVG element not found for download");
            return;
        }

        const clonedSvg = prepareSvgForDownload(svgElement);
        let fileNamePrefix: string = config.type;
        // Process overlay images for QR codes
        if (config.type === "qrcode") {
            await processQRImages(clonedSvg);
        } else {
            fileNamePrefix = `${config.type}_${config.format}`;
        }

        // Convert SVG to PNG with 2x scale for better quality
        const pngBlob = await convertSvgToPng(clonedSvg, 2);

        // Generate filename if not provided
        const finalFileName = fileName || generateFileName(fileNamePrefix, config.codeValue);
        // Trigger download
        downloadBlob(pngBlob, finalFileName, ref.current?.ownerDocument || document);
    } catch (error) {
        console.error(`Error downloading ${config.type}:`, error);
    }
}
