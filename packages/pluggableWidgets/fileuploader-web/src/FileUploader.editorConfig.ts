import { FileUploaderPreviewProps } from "../typings/FileUploaderProps";
import { getPredefinedFormatCaption, parseAllowedFormats } from "./utils/parseAllowedFormats";
import { hideNestedPropertiesIn, Problem, Properties } from "@mendix/pluggable-widgets-tools";

export function getProperties(
    values: FileUploaderPreviewProps,
    properties: Properties /* , target: Platform*/
): Properties {
    values.allowedFileFormats.forEach((p, index) => {
        if (p.configMode === "simple") {
            hideNestedPropertiesIn(properties, values, "allowedFileFormats", index, [
                "mimeType",
                "extensions",
                "typeFormatDescription"
            ]);
        } else {
            hideNestedPropertiesIn(properties, values, "allowedFileFormats", index, ["predefinedType"]);
        }
    });

    const props = properties[0];

    const fileFormats = props.properties?.find(p => p.key === "allowedFileFormats");
    if (fileFormats) {
        // place object headers
        fileFormats.objectHeaders = ["File type", ""];
        fileFormats.objects?.forEach((o, index) => {
            const val = values.allowedFileFormats[index];
            if (val.configMode === "simple") {
                o.captions = [getPredefinedFormatCaption(val.predefinedType), " "];
            } else {
                o.captions = [val.typeFormatDescription, `${mimeConfigColumnText(val.mimeType, val.extensions)}`];
            }
        });
    }

    return properties;
}

export function check(values: FileUploaderPreviewProps): Problem[] {
    const errors: Problem[] = [];
    // Add errors to the above array to throw errors in Studio and Studio Pro.

    if (values.allowedFileFormats.length) {
        try {
            parseAllowedFormats(values.allowedFileFormats);
        } catch (e: unknown) {
            if (e instanceof Error) {
                errors.push({
                    property: "allowedFileFormats",
                    message: e.message
                });
            }
        }
    }

    if (!values.createFileAction) {
        errors.push({
            property: "createFileAction",
            message: "Action to create new files must be configured."
        });
    }

    if (!values.maxFilesPerUpload || values.maxFilesPerUpload < 1) {
        errors.push({
            property: "maxFilesPerUpload",
            message: "There must be at least one file per upload allowed."
        });
    }

    return errors;
}

function mimeConfigColumnText(mime: string, exts: string): string {
    if (mime && exts) {
        return `[${mime}](${exts})`;
    }

    if (mime && !exts) {
        return `[${mime}]`;
    }

    if (!mime && exts) {
        return `(${exts})`;
    }

    return "<not set>";
}

// export function getPreview(values: FileUploaderPreviewProps, isDarkMode: boolean, version: number[]): PreviewProps {
//     // Customize your pluggable widget appearance for Studio Pro.
//     return {
//         type: "Container",
//         children: []
//     }
// }

// export function getCustomCaption(values: FileUploaderPreviewProps, platform: Platform): string {
//     return "FileUploader";
// }
