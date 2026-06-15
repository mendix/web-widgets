// Allow only the URI schemes the Mendix platform legitimately produces for images.
// Blocks javascript:/vbscript:/data:text style payloads as defense-in-depth.
const ALLOWED = /^(https?:|blob:|data:image\/)/i;

export function safeImageUri(uri: string | undefined): string | undefined {
    if (!uri) {
        return undefined;
    }
    return ALLOWED.test(uri.trim()) ? uri : undefined;
}
