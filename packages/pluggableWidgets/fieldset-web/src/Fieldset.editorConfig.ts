import {
    DropZoneProps,
    RowLayoutProps,
    StructurePreviewProps,
    TextProps,
    structurePreviewPalette
} from "@mendix/widget-plugin-platform/preview/structure-preview-api";
import { FieldsetPreviewProps } from "../typings/FieldsetProps";

export function getPreview(values: FieldsetPreviewProps, isDarkMode: boolean): StructurePreviewProps | null {
    const palette = structurePreviewPalette[isDarkMode ? "dark" : "light"];
    return {
        type: "Container",
        borders: true,
        borderWidth: 1,
        children: [
            {
                type: "Container",
                backgroundColor: palette.background.topbarStandard,
                children: [
                    {
                        type: "Container",
                        padding: 10,
                        children: [
                            {
                                type: "Text",
                                content: values.legend || "Legend",
                                fontSize: 14,
                                bold: true
                            } as TextProps
                        ]
                    }
                ]
            },
            {
                type: "RowLayout",
                children: [
                    {
                        type: "DropZone",
                        property: values.content,
                        placeholder: "Place fieldset content here"
                    } as DropZoneProps
                ]
            } as RowLayoutProps
        ]
    };
}

export function getCustomCaption(values: FieldsetPreviewProps): string {
    return values.legend || "Fieldset";
}
