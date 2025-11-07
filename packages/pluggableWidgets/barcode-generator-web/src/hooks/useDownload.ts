import { useCallback } from "react";

// Constants
const NAMESPACES = {
    SVG: "http://www.w3.org/2000/svg",
    XLINK: "http://www.w3.org/1999/xlink"
} as const;

const FILENAMES = {
    QRCode: "qrcode.svg",
    default: "barcode.svg"
} as const;

interface UseDownloadParams {
    format: string;
    svgRef: React.RefObject<SVGSVGElement>;
    qrContainerRef: React.RefObject<HTMLDivElement>;
}
interface UseDownloadReturn {
    downloadSVG: () => Promise<void>;
}

// Private helper functions

// Get the appropriate SVG element based on format
const getSvgElement = (
    format: string,
    svgRef: React.RefObject<SVGSVGElement>,
    qrContainerRef: React.RefObject<HTMLDivElement>
): SVGSVGElement | null => {
    if (format === "QRCode") {
        return qrContainerRef.current?.querySelector("svg") || null;
    }
    return svgRef.current;
};

// Get filename based on format
const getFilename = (format: string): string => {
    return format === "QRCode" ? FILENAMES.QRCode : FILENAMES.default;
};

// Prepare SVG for download by setting namespaces
const prepareSvgForDownload = (svgElement: SVGSVGElement): SVGSVGElement => {
    const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
    clonedSvg.setAttribute("xmlns", NAMESPACES.SVG);
    clonedSvg.setAttribute("xmlns:xlink", NAMESPACES.XLINK);
    return clonedSvg;
};

// Convert image URL to base64
const convertImageToBase64 = async (url: string): Promise<string> => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        const blob = await response.blob();

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error("Failed to convert image to base64"));
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.warn("Failed to convert image to base64:", error);
        return url; // Return original URL as fallback
    }
};

// Check if URL is external (http/https)
const isExternalUrl = (url: string): boolean => {
    return url.startsWith("http://") || url.startsWith("https://");
};

// Convert overlay images to base64 for QR codes
const processQRImages = async (clonedSvg: SVGSVGElement): Promise<void> => {
    const imageElement = clonedSvg.querySelector("image");
    if (imageElement) {
        const hrefValue = imageElement.getAttribute("href") || imageElement.getAttribute("xlink:href");
        if (hrefValue && isExternalUrl(hrefValue)) {
            const base64 = await convertImageToBase64(hrefValue);
            // Use modern href attribute and remove any existing xlink:href
            imageElement.setAttribute("href", base64);
            imageElement.removeAttribute("xlink:href");
        }
    }
};

// Create and trigger download
const downloadBlob = (blob: Blob, filename: string): void => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export function useDownload({ format, svgRef, qrContainerRef }: UseDownloadParams): UseDownloadReturn {
    const downloadSVG = useCallback(async () => {
        // Get the appropriate SVG element
        const svgElement = getSvgElement(format, svgRef, qrContainerRef);
        if (!svgElement) {
            console.error("SVG element not found for download");
            return;
        }

        try {
            // Prepare SVG for download (clone and set namespaces)
            const clonedSvg = prepareSvgForDownload(svgElement);

            // Process QR code images if needed
            if (format === "QRCode") {
                await processQRImages(clonedSvg);
            }

            // Serialize the SVG
            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(clonedSvg);

            // Create download blob and trigger download
            const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
            const filename = getFilename(format);
            downloadBlob(blob, filename);
        } catch (error) {
            console.error("Error downloading SVG:", error);
        }
    }, [format, svgRef, qrContainerRef]);

    return { downloadSVG };
}
