import { AllowedFileFormatsPreviewType } from "../../typings/FileUploaderProps";

export type MimeCheckFormat = {
    [key: string]: string[];
};

export function parseAllowedFormats(allowedFileFormats: AllowedFileFormatsPreviewType[]): MimeCheckFormat {
    return allowedFileFormats.reduce((acc, f) => {
        const [type, subType] = parseMimeType(f.mimeType.trim());

        acc[`${type}/${subType}`] = parseExtensionsList(f.extensions);

        return acc;
    }, {} as MimeCheckFormat);
}

function parseMimeType(c: string): [string, string] {
    if (/^[^/]+\/[^/]+$/.test(c)) {
        // "type/subtype" string
        const [type, subtype] = c.split("/");
        return [type, subtype];
    }

    throw new Error(`Value '${c}' is not recognized. Accepted format: 'image/jpeg'`);
}

function parseExtensionsList(config: string): string[] {
    return config
        .trim()
        .split(",")
        .map(c => c.trim())
        .filter(c => c)
        .map(c => {
            if (/^\.\w+$/.test(c)) {
                // ".ext" string
                // remove dot
                return c.substring(1);
            }

            throw new Error(`Value '${c}' is not recognized. Accepted format: '.pdf'`);
        });
}
