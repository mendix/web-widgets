import { RefObject, useCallback } from "react";
import { downloadBlob, FILENAMES, prepareSvgForDownload } from "../utils/download-utils";

interface UseDownloadBarcodeParams {
    ref: RefObject<SVGSVGElement | null>;
}
interface UseDownloadBarcodeReturn {
    downloadBarcode: () => Promise<void>;
}

export function useDownloadBarcode({ ref }: UseDownloadBarcodeParams): UseDownloadBarcodeReturn {
    const downloadBarcode = useCallback(async () => {
        const svgElement = ref.current;
        if (!svgElement) {
            console.error("SVG element not found for download");
            return;
        }

        try {
            const clonedSvg = prepareSvgForDownload(svgElement);
            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(clonedSvg);

            // Create download blob and trigger download
            const blobOptions = {
                type: "image/svg+xml;charset=utf-8",
                lastModified: Date.now()
            };
            const blob = new Blob([svgString], blobOptions);
            const filename = FILENAMES.Barcode;
            downloadBlob(blob, filename);
        } catch (error) {
            console.error("Error downloading barcode:", error);
        }
    }, [ref]);

    return { downloadBarcode };
}
