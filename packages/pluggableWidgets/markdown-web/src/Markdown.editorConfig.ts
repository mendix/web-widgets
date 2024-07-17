import {
    StructurePreviewProps,
    structurePreviewPalette
} from "@mendix/widget-plugin-platform/preview/structure-preview-api";
import { MarkdownPreviewProps } from "../typings/MarkdownProps";

export function getPreview(_values: MarkdownPreviewProps, isDarkMode: boolean): StructurePreviewProps {
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

export function getCustomCaption(_values: MarkdownPreviewProps): string {
    return `[${_values.stringAttribute ?? "No attribute selected"}]`;
}
