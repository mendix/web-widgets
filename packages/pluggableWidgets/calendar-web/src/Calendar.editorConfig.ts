import {
    container,
    rowLayout,
    structurePreviewPalette,
    StructurePreviewProps,
    text
} from "@mendix/widget-plugin-platform/preview/structure-preview-api";
import { hideNestedPropertiesIn, hidePropertiesIn, hidePropertyIn, Properties } from "@mendix/pluggable-widgets-tools";
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

    if (values.view === "standard") {
        hidePropertiesIn(defaultProperties, values, [
            "defaultViewCustom",
            "toolbarItems",
            "customViewShowMonday",
            "customViewShowTuesday",
            "customViewShowWednesday",
            "customViewShowThursday",
            "customViewShowFriday",
            "customViewShowSaturday",
            "customViewShowSunday"
        ]);
    } else {
        hidePropertiesIn(defaultProperties, values, ["defaultViewStandard", "topBarDateFormat"]);
    }

    values.toolbarItems?.forEach((item, index) => {
        if (item.itemType === "title") {
            hideNestedPropertiesIn(defaultProperties, values, "toolbarItems", index, ["buttonTooltip", "buttonStyle"]);
        }
        // Hide all format properties for non-view items (navigation buttons, title)
        if (!["day", "month", "agenda", "week", "work_week"].includes(item.itemType)) {
            hideNestedPropertiesIn(defaultProperties, values, "toolbarItems", index, [
                "customViewHeaderDayFormat",
                "customViewCellDateFormat",
                "customViewGutterDateFormat",
                "customViewGutterTimeFormat",
                "customViewAllDayText",
                "customViewTextHeaderDate",
                "customViewTextHeaderTime",
                "customViewTextHeaderEvent"
            ]);
        } else {
            switch (item.itemType) {
                case "day":
                case "week":
                case "work_week":
                    // Day/Week/Custom Week: show headerDayFormat, hide all others
                    hideNestedPropertiesIn(defaultProperties, values, "toolbarItems", index, [
                        "customViewCellDateFormat",
                        "customViewGutterDateFormat",
                        "customViewAllDayText",
                        "customViewTextHeaderDate",
                        "customViewTextHeaderTime",
                        "customViewTextHeaderEvent"
                    ]);
                    break;
                case "month":
                    // Month: show headerDayFormat and cellDateFormat, hide gutter/agenda-specific
                    hideNestedPropertiesIn(defaultProperties, values, "toolbarItems", index, [
                        "customViewGutterDateFormat",
                        "customViewGutterTimeFormat",
                        "customViewAllDayText",
                        "customViewTextHeaderDate",
                        "customViewTextHeaderTime",
                        "customViewTextHeaderEvent"
                    ]);
                    break;
                case "agenda":
                    // Agenda: show gutter and text headers, hide headerDayFormat and cellDateFormat
                    hideNestedPropertiesIn(defaultProperties, values, "toolbarItems", index, [
                        "customViewCellDateFormat"
                    ]);
                    break;
            }
        }
    });

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
            container({ padding: 4, grow: 0 })({
                type: "Image",
                document: decodeURIComponent((isDarkMode ? IconSVGDark : IconSVG).replace("data:image/svg+xml,", "")),
                width: 16,
                height: 16
            }),
            container({
                padding: 4
            })(text({ fontColor: palette.text.primary })("Calendar"))
        )
    );
}
