import {
    StructurePreviewProps,
    structurePreviewPalette
} from "@mendix/widget-plugin-platform/preview/structure-preview-api";
import { MarkdownPreviewProps } from "../typings/MarkdownProps";

export function getPreview(_values: MarkdownPreviewProps, isDarkMode: boolean): StructurePreviewProps {
    const palette = structurePreviewPalette[isDarkMode ? "dark" : "light"];
    return {
        type: "RowLayout",
        columnSize: "grow",
        children: [
            {
                type: "Container",
                children: [
                    {
                        type: "Container",
                        children: [
                            {
                                type: "Text",
                                content: "Markdown editor",
                                fontColor: palette.text.primary,
                                bold: true,
                                fontSize: 8
                            }
                        ],
                        padding: 8
                    }
                ],
                backgroundColor: palette.background.buttonInfo,
                borderRadius: 8
            },
            { type: "Container", grow: 2 }
        ]
    };
}

export function getCustomCaption(_values: MarkdownPreviewProps): string {
    return "Markdown editor";
}
