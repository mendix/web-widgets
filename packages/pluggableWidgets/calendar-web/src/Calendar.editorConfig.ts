import {
    container,
    rowLayout,
    structurePreviewPalette,
    StructurePreviewProps,
    svgImage,
    text
} from "@mendix/widget-plugin-platform/preview/structure-preview-api";
import { Properties, hidePropertyIn, hidePropertiesIn } from "@mendix/pluggable-widgets-tools";
import { CalendarPreviewProps } from "../typings/CalendarProps";
import IconSVGDark from "./assets/StructureCalendarDark.svg";
import IconSVG from "./assets/StructureCalendarLight.svg";

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
    const readOnly = _values.readOnly;

    return container({
        backgroundColor: readOnly ? palette.background.containerDisabled : palette.background.topbarData,
        borders: true
    })(
        rowLayout({
            columnSize: "grow",
            padding: 6
        })(
            svgImage({ width: 16, height: 16, grow: 0 })(
                decodeURIComponent((isDarkMode ? IconSVGDark : IconSVG).replace("data:image/svg+xml,", ""))
            ),
            text({ fontColor: palette.text.primary })("Calendar")
        )
    );
}
