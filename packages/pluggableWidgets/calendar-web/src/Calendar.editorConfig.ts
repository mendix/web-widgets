import {
    StructurePreviewProps,
    container,
    rowLayout,
    structurePreviewPalette,
    text
} from "@mendix/widget-plugin-platform/preview/structure-preview-api";
import { Properties, hidePropertyIn, hidePropertiesIn } from "@mendix/pluggable-widgets-tools";
import { CalendarPreviewProps } from "../typings/CalendarProps";

export function getProperties(values: CalendarPreviewProps, defaultProperties: Properties): Properties {
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

    // Show/hide title properties based on selection
    if (values.titleType === "attribute") {
        hidePropertyIn(defaultProperties, values, "titleExpression");
    } else {
        hidePropertyIn(defaultProperties, values, "titleAttribute");
    }

    return defaultProperties;
}

export function getPreview(_values: CalendarPreviewProps, isDarkMode: boolean): StructurePreviewProps {
    const palette = structurePreviewPalette[isDarkMode ? "dark" : "light"];

    return rowLayout({ columnSize: "grow", borders: true, backgroundColor: palette.background.containerFill })(
        container()(),
        rowLayout({ grow: 2, padding: 8 })(text({ fontColor: palette.text.primary, grow: 10 })("calendar")),
        container()()
    );
}
