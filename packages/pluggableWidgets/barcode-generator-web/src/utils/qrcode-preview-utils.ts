export const QR_IMAGE_PLACEHOLDER =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'>" +
    "<rect width='80' height='80' fill='%23e6e6e6'/>" +
    "<path d='M16 56 L64 24' stroke='%23999999' stroke-width='6'/>" +
    "<path d='M16 24 L64 56' stroke='%23999999' stroke-width='6'/>" +
    "</svg>";

// Resolve the actual image URL from user config
export function resolveQRImageSrc(qrImageSrc: any, imageSrcError: boolean): string {
    if (!qrImageSrc) {
        return QR_IMAGE_PLACEHOLDER;
    }

    if (imageSrcError) {
        return QR_IMAGE_PLACEHOLDER;
    }

    // Static image URL
    if (qrImageSrc.type === "static") {
        return qrImageSrc.imageUrl;
    }

    // Dynamic image (from data entity) - not directly resolvable in preview
    // Fall back to placeholder
    return QR_IMAGE_PLACEHOLDER;
}
