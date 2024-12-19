import { AllowedFileFormatsPreviewType, AllowedFileFormatsType } from "../../typings/FileUploaderProps";
import { FileCheckFormat, predefinedFormats } from "./predefinedFormats";

export type MimeCheckFormat = {
    [key: string]: string[];
};

export function getImageUploaderFormats(): FileCheckFormat[] {
    return [predefinedFormats.anyImageFile];
}

export function parseAllowedFormats(
    allowedFileFormats: Array<AllowedFileFormatsPreviewType | AllowedFileFormatsType>
): FileCheckFormat[] {
    const map = new Map<string, FileCheckFormat>();

    for (const format of allowedFileFormats) {
        if (format.configMode === "simple") {
            const f = predefinedFormats[format.predefinedType];
            map.set(f.description, f);
        } else {
            const key =
                (typeof format.typeFormatDescription === "string"
                    ? format.typeFormatDescription
                    : format.typeFormatDescription?.value) || "default"; // todo: wait for load?
            const [mime, exts] = [parseMimeType(format.mimeType.trim()), parseExtensionsList(format.extensions)];
            const mapEntry = map.get(key);
            if (mapEntry) {
                mapEntry.entries.push([mime, exts]);
            } else {
                map.set(key, {
                    entries: [[mime, exts]],
                    description: key
                });
            }
        }
    }

    return Array.from(map.values());
}

function parseMimeType(c: string): string {
    if (c === "") {
        return "dummy/mime";
    }
    if (/^[^/]+\/[^/]+$/.test(c)) {
        // "type/subtype" string
        const [type, subtype] = c.split("/");
        return `${type.trim()}/${subtype.trim()}`;
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
                return c;
            }

            throw new Error(`Value '${c}' is not recognized. Accepted format: '.pdf'`);
        });
}
