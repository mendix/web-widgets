import {
    container,
    rowLayout,
    structurePreviewPalette,
    StructurePreviewProps,
    text
} from "@mendix/widget-plugin-platform/preview/structure-preview-api";
import { Properties, hidePropertyIn, hidePropertiesIn } from "@mendix/pluggable-widgets-tools";
import { CalendarPreviewProps } from "../typings/CalendarProps";
import IconSVGDark from "./assets/StructureCalendarDark.svg";
import IconSVG from "./assets/StructureCalendarLight.svg";

const CUSTOM_VIEW_CONFIG: Array<keyof CalendarPreviewProps> = [
    "customViewShowDay",
    "customViewShowWeek",
    "customViewShowMonth",
    "customViewShowAgenda",
    "customViewShowCustomWeek",
    "customViewCaption",
    "defaultViewCustom"
];

const CUSTOM_VIEW_DAYS_CONFIG: Array<keyof CalendarPreviewProps> = [
    "customViewShowMonday",
    "customViewShowTuesday",
    "customViewShowWednesday",
    "customViewShowThursday",
    "customViewShowFriday",
    "customViewShowSaturday",
    "customViewShowSunday"
];

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

    // Hide custom week range properties when the view is set to 'standard'
    if (values.view === "standard") {
        hidePropertiesIn(defaultProperties, values, [...CUSTOM_VIEW_CONFIG, ...CUSTOM_VIEW_DAYS_CONFIG]);
    } else {
        hidePropertyIn(defaultProperties, values, "defaultViewStandard");

        if (values.customViewShowCustomWeek === false) {
            hidePropertiesIn(defaultProperties, values, ["customViewCaption", ...CUSTOM_VIEW_DAYS_CONFIG]);
        }
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
            columnSize: "fixed",
            padding: 6
        })(
            {
                type: "Image",
                document: decodeURIComponent((isDarkMode ? IconSVGDark : IconSVG).replace("data:image/svg+xml,", "")),
                width: 16,
                height: 16
            },
            text({ fontColor: palette.text.primary })("Calendar")
        )
    );
}
