import { Properties } from "@mendix/pluggable-widgets-tools";
import {
    StructurePreviewProps,
    structurePreviewPalette
} from "@mendix/widget-plugin-platform/preview/structure-preview-api";
import { DocumentViewerPreviewProps } from "typings/DocumentViewerProps";

export function getProperties(_values: DocumentViewerPreviewProps, defaultProperties: Properties): Properties {
    return defaultProperties;
}

export function getPreview(_values: DocumentViewerPreviewProps, isDarkMode: boolean): StructurePreviewProps {
    const palette = structurePreviewPalette[isDarkMode ? "dark" : "light"];
    return {
        type: "Container",
        children: [
            {
                type: "RowLayout",
                grow: 2,
                columnSize: "grow",
                borders: true,
                borderWidth: 1,
                borderRadius: 2,
                backgroundColor: _values.readOnly ? palette.background.containerDisabled : palette.background.container,
                children: [
                    {
                        type: "Container",
                        grow: 1,
                        padding: 4,
                        children: [
                            {
                                type: "Text",
                                content: getCustomCaption(_values),
                                fontColor: palette.text.data
                            }
                        ]
                    }
                ],
                padding: 8
            }
        ],
        backgroundColor: palette.background.container,
        borderRadius: 8
    };
}

export function getCustomCaption(_values: DocumentViewerPreviewProps): string {
    return `[${_values.file ?? "No attribute selected"}]`;
}
