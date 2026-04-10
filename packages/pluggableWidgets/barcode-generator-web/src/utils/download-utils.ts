// SVG download and processing utilities

const NAMESPACES = {
    SVG: "http://www.w3.org/2000/svg",
    XLINK: "http://www.w3.org/1999/xlink"
} as const;

export function generateFileName(prefix: string, codeValue: string): string {
    // Auto-generate filename with format and hash
    const timestamp = generateTimestamp();
    const hash = hashCode(codeValue);
    return `${prefix}_${hash}_${timestamp}.png`;
}

function generateTimestamp(): string {
    // Get current date and time
    const now = new Date();

    // Format: YYYYMMDD_HHMMSS
    const timestamp =
        now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, "0") +
        String(now.getDate()).padStart(2, "0") +
        "_" +
        String(now.getHours()).padStart(2, "0") +
        String(now.getMinutes()).padStart(2, "0") +
        String(now.getSeconds()).padStart(2, "0");

    // Return formatted filename
    return timestamp;
}

function hashCode(s: string): string {
    if (!s) {
        return "empty";
    }

    let hash = 0;
    for (let i = 0; i < s.length; i++) {
        const char = s.charCodeAt(i);
        // eslint-disable-next-line no-bitwise
        hash = (hash << 5) - hash + char;
        // eslint-disable-next-line no-bitwise
        hash = hash & hash; // Convert to 32-bit integer
    }

    // Convert to base36 and take first 10 characters
    return Math.abs(hash).toString(36).substring(0, 10);
}

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

export const downloadBlob = (blob: Blob, filename: string, currentDocument: Document = document): void => {
    const url = URL.createObjectURL(blob);
    const link = currentDocument.createElement("a");
    link.href = url;
    link.download = filename;
    currentDocument.body.appendChild(link);
    link.click();
    currentDocument.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const convertSvgToPng = async (svgElement: SVGSVGElement, scale = 2): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgElement);
        const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);

        const img = new Image();
        img.onload = () => {
            try {
                const canvas = svgElement.ownerDocument.createElement("canvas");
                const ctx = canvas.getContext("2d");

                if (!ctx) {
                    throw new Error("Failed to get canvas context");
                }

                // Set canvas dimensions with scale for better quality
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;

                // Fill white background (important for transparency)
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Draw the image scaled
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                canvas.toBlob(
                    blob => {
                        URL.revokeObjectURL(url);
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error("Failed to create PNG blob"));
                        }
                    },
                    "image/png",
                    1.0
                );
            } catch (error) {
                URL.revokeObjectURL(url);
                reject(error);
            }
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Failed to load SVG image"));
        };

        img.src = url;
    });
};
