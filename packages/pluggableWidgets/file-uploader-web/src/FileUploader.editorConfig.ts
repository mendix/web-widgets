import { FileUploaderPreviewProps } from "../typings/FileUploaderProps";
import { parseAllowedFormats } from "./utils/parseAllowedFormats";
import { hideNestedPropertiesIn, hidePropertiesIn, Problem, Properties } from "@mendix/pluggable-widgets-tools";
import { predefinedFormats } from "./utils/predefinedFormats";

export function getProperties(
    values: FileUploaderPreviewProps,
    properties: Properties /* , target: Platform*/
): Properties {
    if (!values.readOnlyMode) {
        if (values.uploadMode === "files") {
            hidePropertiesIn(properties, values, ["associatedImages", "createImageAction"]);
            processAllowedFormats(values, properties);
        } else {
            hidePropertiesIn(properties, values, ["associatedFiles", "createFileAction", "allowedFileFormats"]);
        }
    } else {
        hidePropertiesIn(properties, values, [
            values.uploadMode === "files" ? "associatedImages" : "associatedFiles",
            "createImageAction",
            "createFileAction",
            "allowedFileFormats",
            "maxFilesPerUpload",
            "maxFileSize",
            "objectCreationTimeout"
        ]);
    }

    return properties;
}

function processAllowedFormats(values: FileUploaderPreviewProps, properties: Properties): void {
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

    const fileFormats = properties[0].properties?.find(p => p.key === "allowedFileFormats");
    if (fileFormats) {
        // place object headers
        fileFormats.objectHeaders = ["File type", ""];
        fileFormats.objects?.forEach((o, index) => {
            const val = values.allowedFileFormats[index];
            if (val.configMode === "simple") {
                o.captions = [predefinedFormats[val.predefinedType].description, " "];
            } else {
                o.captions = [val.typeFormatDescription, `${mimeConfigColumnText(val.mimeType, val.extensions)}`];
            }
        });
    }
}

export function check(values: FileUploaderPreviewProps): Problem[] {
    const errors: Problem[] = [];
    // Add errors to the above array to throw errors in Studio and Studio Pro.

    if (!values.readOnlyMode) {
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

        if (!values.maxFilesPerUpload || values.maxFilesPerUpload < 1) {
            errors.push({
                property: "maxFilesPerUpload",
                message: "There must be at least one file per upload allowed."
            });
        }
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

export function getCustomCaption(_values: FileUploaderPreviewProps): string {
    return `File uploader (${_values.uploadMode}${_values.readOnlyMode && ", read only"})`;
}
