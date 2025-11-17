import { RefObject, useCallback } from "react";
import { downloadBlob, FILENAMES, prepareSvgForDownload, processQRImages } from "../utils/download-utils";

interface UseDownloadParams {
    ref: RefObject<SVGSVGElement | null>;
}
interface UseDownloadReturn {
    downloadQrCode: () => Promise<void>;
}

export function useDownloadQrCode({ ref }: UseDownloadParams): UseDownloadReturn {
    const downloadQrCode = useCallback(async () => {
        const svgElement = ref.current;
        if (!svgElement) {
            console.error("SVG element not found for download");
            return;
        }

        try {
            const clonedSvg = prepareSvgForDownload(svgElement);

            // Process overlay images for QR codes
            await processQRImages(clonedSvg);

            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(clonedSvg);

            // Create download blob and trigger download
            const blobOptions = {
                type: "image/svg+xml;charset=utf-8",
                lastModified: Date.now()
            };
            const blob = new Blob([svgString], blobOptions);
            const filename = FILENAMES.QRCode;
            downloadBlob(blob, filename);
        } catch (error) {
            console.error("Error downloading SVG:", error);
        }
    }, [ref]);

    return { downloadQrCode };
}
