import {
    DropZoneProps,
    RowLayoutProps,
    StructurePreviewProps,
    TextProps
} from "@mendix/pluggable-widgets-commons/dist";
import { FieldsetPreviewProps } from "../typings/FieldsetProps";

export function getPreview(values: FieldsetPreviewProps, isDarkMode: boolean): StructurePreviewProps | null {
    return {
        type: "Container",
        borders: true,
        borderWidth: 1,
        children: [
            {
                type: "Container",
                backgroundColor: isDarkMode ? "#454545" : undefined,
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
                backgroundColor: values.content.widgetCount > 0 ? undefined : isDarkMode ? undefined : "#F8F8F8",
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
