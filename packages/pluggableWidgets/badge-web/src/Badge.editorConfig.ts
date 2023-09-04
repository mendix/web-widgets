import {
    StructurePreviewProps,
    structurePreviewPalette
} from "@mendix/widget-plugin-platform/preview/structure-preview-api";
import { BadgePreviewProps } from "../typings/BadgeProps";

export function getPreview(values: BadgePreviewProps, isDarkMode: boolean): StructurePreviewProps {
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
                                content: values.value,
                                fontColor: palette.text.primary,
                                bold: true,
                                fontSize: 8
                            }
                        ],
                        padding: values.value ? 8 : 18
                    }
                ],
                backgroundColor: palette.background.buttonInfo,
                borderRadius: values.type === "badge" ? 22 : 8
            },
            { type: "Container", grow: 2 }
        ]
    };
}

export function getCustomCaption(values: BadgePreviewProps): string {
    return values?.value || "Badge";
}
