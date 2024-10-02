import {
    AllowedFileFormatsPreviewType,
    AllowedFileFormatsType,
    PredefinedTypeEnum
} from "../../typings/FileUploaderProps";

export type MimeCheckFormat = {
    [key: string]: string[];
};

export function parseAllowedFormats(
    allowedFileFormats: (AllowedFileFormatsPreviewType | AllowedFileFormatsType)[]
): MimeCheckFormat {
    return allowedFileFormats.reduce((acc, f) => {
        const [key, exts] =
            f.configMode === "simple"
                ? getPredefinedFormat(f.predefinedType)
                : [parseMimeType(f.mimeType.trim()), parseExtensionsList(f.extensions)];

        if (acc[key]) {
            acc[key] = acc[key].concat(exts);
        } else {
            acc[key] = exts;
        }

        return acc;
    }, {} as MimeCheckFormat);
}

export function getAllowedFormatsDescription(allowedFileFormats: AllowedFileFormatsType[]): string {
    return allowedFileFormats
        .map(f => {
            if (f.configMode === "simple") {
                return getPredefinedFormatCaption(f.predefinedType);
            }

            return f.typeFormatDescription.value;
        })
        .filter(f => f)
        .join(", ");
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

const predefinedFormats: Record<PredefinedTypeEnum, [string, string[]]> = {
    pdfFile: ["application/pdf", []],
    msWordFile: ["dummy/mime", [".doc,.docx"]],
    msExcelFile: ["dummy/mime", [".xls,.xlsx"]],
    msPowerPointFile: ["dummy/mime", [".ppt,.pptx"]],
    plainTextFile: ["dummy/mime", [".ppt,.pptx"]],
    csvFile: ["dummy/mime", [".csv"]],
    anyTextFile: ["text/*", []],
    anyImageFile: ["image/*", []],
    anyAudioFile: ["audio/*", []],
    anyVideoFile: ["video/*", []],
    zipArchiveFile: ["dummy/mime", [".zip"]]
};

const predefinedFormatsCaptions: Record<PredefinedTypeEnum, string> = {
    pdfFile: "PDF document (.pdf)",
    msWordFile: "Microsoft Word (.doc and .docx)",
    msExcelFile: "Microsoft Excel (.xls and .xlsx)",
    msPowerPointFile: "Microsoft Powerpoint (.ppt and .pptx)",
    plainTextFile: "Plain Text (.txt)",
    csvFile: "CSV (.csv)",
    anyTextFile: "All texts",
    anyImageFile: "Image",
    anyAudioFile: "Audio",
    anyVideoFile: "Video",
    zipArchiveFile: "Zip archive"
};

function getPredefinedFormat(format: PredefinedTypeEnum): [string, string[]] {
    return predefinedFormats[format];
}

export function getPredefinedFormatCaption(format: PredefinedTypeEnum): string {
    return predefinedFormatsCaptions[format];
}
