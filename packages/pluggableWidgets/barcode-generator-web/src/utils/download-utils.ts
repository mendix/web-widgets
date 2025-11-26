// SVG download and processing utilities

const NAMESPACES = {
    SVG: "http://www.w3.org/2000/svg",
    XLINK: "http://www.w3.org/1999/xlink"
} as const;

const FILENAMES = {
    QRCode: "qrcode.svg",
    Barcode: "barcode.svg"
} as const;

// Prepare SVG for download by setting namespaces
export const prepareSvgForDownload = (svgElement: SVGSVGElement): SVGSVGElement => {
    const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
    clonedSvg.setAttribute("xmlns", NAMESPACES.SVG);
    clonedSvg.setAttribute("xmlns:xlink", NAMESPACES.XLINK);
    return clonedSvg;
};

export const convertImageToBase64 = async (url: string): Promise<string> => {
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
export const isExternalUrl = (url: string): boolean => {
    return url.startsWith("http://") || url.startsWith("https://");
};

// Convert overlay images to base64 for QR codes
export const processQRImages = async (clonedSvg: SVGSVGElement): Promise<void> => {
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

export const downloadBlob = (blob: Blob, filename: string): void => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export { FILENAMES };
