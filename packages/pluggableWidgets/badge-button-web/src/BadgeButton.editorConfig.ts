import { BadgeButtonPreviewProps } from "../typings/BadgeButtonProps";
import {
    StructurePreviewProps,
    structurePreviewPalette
} from "@mendix/widget-plugin-platform/preview/structure-preview-api";

export function getPreview(values: BadgeButtonPreviewProps, isDarkMode: boolean): StructurePreviewProps {
    const palette = structurePreviewPalette[isDarkMode ? "dark" : "light"];
    const buttonBg = palette.background.buttonInfo;

    return {
        type: "RowLayout",
        columnSize: "grow",
        children: [
            {
                type: "Container",
                children: [
                    {
                        type: "RowLayout",
                        columnSize: "grow",
                        padding: 8,
                        grow: 0,
                        children: [
                            {
                                type: "Container",
                                children: [
                                    {
                                        type: "Text",
                                        content: values.label,
                                        fontColor: "#FFF",
                                        bold: true,
                                        fontSize: 8
                                    }
                                ],
                                grow: 0,
                                padding: 4
                            },
                            {
                                type: "Container",
                                children: [
                                    {
                                        type: "Container",
                                        children: [
                                            {
                                                type: "Text",
                                                content: values.value,
                                                fontColor: buttonBg,
                                                bold: true,
                                                fontSize: 8
                                            }
                                        ],
                                        padding: values.value ? 4 : 8
                                    }
                                ],
                                backgroundColor: "#FFF",
                                borderRadius: 16
                            }
                        ]
                    }
                ],
                backgroundColor: buttonBg,
                borderRadius: 4
            },
            {
                type: "Container"
            }
        ]
    };
}

export function getCustomCaption(values: BadgeButtonPreviewProps): string {
    return values.label || "Badge button";
}
