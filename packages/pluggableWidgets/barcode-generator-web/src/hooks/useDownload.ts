import { useCallback } from "react";

interface UseDownloadParams {
    format: string;
    svgRef: React.RefObject<SVGSVGElement>;
    qrContainerRef: React.RefObject<HTMLDivElement>;
}
interface UseDownloadReturn {
    downloadSVG: () => void;
}

export function useDownload({ format, svgRef, qrContainerRef }: UseDownloadParams): UseDownloadReturn {
    const downloadSVG = useCallback(() => {
        let svgElement: SVGSVGElement | null = null;
        let filename = "";

        if (format === "QRCode") {
            // Find the SVG element inside the QR container
            svgElement = qrContainerRef.current?.querySelector("svg") || null;
            filename = "qrcode.svg";
        } else {
            svgElement = svgRef.current;
            filename = "barcode.svg";
        }

        if (!svgElement) {
            console.error("SVG element not found for download");
            return;
        }

        try {
            // Clone the SVG to avoid modifying the original
            const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;

            // Ensure proper SVG namespace and attributes
            clonedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");

            // Serialize the SVG
            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(clonedSvg);

            // Create download link
            const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up the URL object
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading SVG:", error);
        }
    }, [format, svgRef, qrContainerRef]);

    return { downloadSVG };
}
