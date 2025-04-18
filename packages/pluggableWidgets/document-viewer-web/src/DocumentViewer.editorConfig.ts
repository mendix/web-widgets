import { hidePropertiesIn, hidePropertyIn, Properties } from "@mendix/pluggable-widgets-tools";
import {
    RowLayoutProps,
    StructurePreviewProps,
    structurePreviewPalette
} from "@mendix/widget-plugin-platform/preview/structure-preview-api";
import { DocumentViewerPreviewProps } from "typings/DocumentViewerProps";

export function getProperties(values: DocumentViewerPreviewProps, defaultProperties: Properties): Properties {
    if (values.widthUnit === "contentFit") {
        hidePropertyIn(defaultProperties, values, "width");
    }
    if (values.heightUnit === "percentageOfWidth") {
        hidePropertyIn(defaultProperties, values, "height");
    } else {
        hidePropertiesIn(defaultProperties, values, [
            "minHeight",
            "minHeightUnit",
            "maxHeight",
            "maxHeightUnit",
            "OverflowY"
        ]);
    }

    if (values.minHeightUnit === "none") {
        hidePropertyIn(defaultProperties, values, "minHeight");
    }

    if (values.maxHeightUnit === "none") {
        hidePropertiesIn(defaultProperties, values, ["maxHeight", "OverflowY"]);
    }

    return defaultProperties;
}

export function getPreview(values: DocumentViewerPreviewProps, isDarkMode: boolean): StructurePreviewProps {
    const palette = structurePreviewPalette[isDarkMode ? "dark" : "light"];
    const titleHeader: RowLayoutProps = {
        type: "RowLayout",
        columnSize: "fixed",
        backgroundColor: palette.background.topbarData,
        borders: true,
        borderWidth: 1,
        children: [
            {
                type: "Container",
                padding: 4,
                children: [
                    {
                        type: "Text",
                        content: "Document Viewer",
                        fontColor: palette.text.data
                    }
                ]
            }
        ]
    };
    const content = {
        type: "RowLayout",
        columnSize: "fixed",
        borders: true,
        children: [
            {
                type: "Container",
                children: [
                    {
                        type: "RowLayout",
                        grow: 2,
                        columnSize: "grow",
                        backgroundColor: values.readOnly
                            ? palette.background.containerDisabled
                            : palette.background.container,
                        children: [
                            {
                                type: "Container",
                                grow: 1,
                                padding: 4,
                                children: [
                                    {
                                        type: "Text",
                                        content: getCustomCaption(values),
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
            }
        ]
    } as RowLayoutProps;

    return {
        type: "Container",
        borderRadius: 2,
        borderWidth: 1,
        children: [titleHeader, content]
    };
}

export function getCustomCaption(values: DocumentViewerPreviewProps): string {
    return `[${values.file && values.file.length > 0 ? values.file : "No document selected"}]`;
}
