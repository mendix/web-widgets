import { RefObject, useCallback } from "react";

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
    svgRef: RefObject<SVGSVGElement | null>;
    qrContainerRef: RefObject<HTMLDivElement | null>;
}
interface UseDownloadReturn {
    downloadSVG: () => Promise<void>;
}

const getSvgElement = (
    format: string,
    svgRef: RefObject<SVGSVGElement | null>,
    qrContainerRef: RefObject<HTMLDivElement | null>
): SVGSVGElement | null => {
    if (format === "QRCode") {
        return qrContainerRef.current?.querySelector("svg") || null;
    }
    return svgRef.current;
};

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
        const svgElement = getSvgElement(format, svgRef, qrContainerRef);
        if (!svgElement) {
            console.error("SVG element not found for download");
            return;
        }

        try {
            const clonedSvg = prepareSvgForDownload(svgElement);

            // Process QR code images if needed
            if (format === "QRCode") {
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
            const filename = getFilename(format);
            downloadBlob(blob, filename);
        } catch (error) {
            console.error("Error downloading SVG:", error);
        }
    }, [format, svgRef, qrContainerRef]);

    return { downloadSVG };
}
