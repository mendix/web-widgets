import { hidePropertiesIn, hidePropertyIn, Properties } from "@mendix/pluggable-widgets-tools";
import {
    RowLayoutProps,
    StructurePreviewProps,
    structurePreviewPalette,
    rowLayout,
    container,
    text
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
            "overflowY"
        ]);
    }

    if (values.minHeightUnit === "none") {
        hidePropertyIn(defaultProperties, values, "minHeight");
    }

    if (values.maxHeightUnit === "none") {
        hidePropertiesIn(defaultProperties, values, ["maxHeight", "overflowY"]);
    }

    return defaultProperties;
}

export function getPreview(values: DocumentViewerPreviewProps, isDarkMode: boolean): StructurePreviewProps {
    const palette = structurePreviewPalette[isDarkMode ? "dark" : "light"];
    const titleHeader: RowLayoutProps = rowLayout({
        columnSize: "fixed",
        backgroundColor: palette.background.topbarData,
        borders: true,
        borderWidth: 1
    })(
        container({
            padding: 4
        })(text({ fontColor: palette.text.data })("Document Viewer"))
    );

    const content = rowLayout({
        columnSize: "fixed",
        borders: true
    })(
        container()(
            rowLayout({
                grow: 2,
                columnSize: "grow",
                backgroundColor: values.readOnly ? palette.background.containerDisabled : palette.background.container
            })(
                container({
                    grow: 1,
                    padding: 4
                })(text({ fontColor: palette.text.data })(getCustomCaption(values)))
            )
        )
    );

    return container({
        borderRadius: 2,
        borderWidth: 1
    })(titleHeader, content);
}

export function getCustomCaption(values: DocumentViewerPreviewProps): string {
    return `[${values.file && values.file.length > 0 ? values.file : "No document selected"}]`;
}
