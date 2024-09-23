import { FileUploaderPreviewProps } from "../typings/FileUploaderProps";
import { parseAllowedFormats } from "./utils/parseAllowedFormats";
import { Problem, Properties } from "@mendix/pluggable-widgets-tools";

export function getProperties(
    _values: FileUploaderPreviewProps,
    defaultProperties: Properties /* , target: Platform*/
): Properties {
    return defaultProperties;
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

    if (!values.maxFilesPerUpload || values.maxFilesPerUpload < 1) {
        errors.push({
            property: "maxFilesPerUpload",
            message: "There must be at least one file per upload allowed."
        });
    }

    return errors;
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
