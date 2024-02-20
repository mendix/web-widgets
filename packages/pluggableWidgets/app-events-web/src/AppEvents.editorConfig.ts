import { Properties, hidePropertiesIn } from "@mendix/pluggable-widgets-tools";
import { AppEventsPreviewProps } from "../typings/AppEventsProps";
import {
    StructurePreviewProps,
    structurePreviewPalette
} from "@mendix/widget-plugin-platform/preview/structure-preview-api";

export function getProperties(
    values: AppEventsPreviewProps,
    defaultProperties: Properties /* , target: Platform*/
): Properties {
    if (!values.componentLoadRepeat) {
        hidePropertiesIn(defaultProperties, values, ["componentLoadRepeatInterval"]);
    }
    return defaultProperties;
}

export function getPreview(_values: AppEventsPreviewProps, isDarkMode: boolean): StructurePreviewProps {
    const palette = structurePreviewPalette[isDarkMode ? "dark" : "light"];
    return {
        type: "Container",
        children: [
            {
                type: "Text",
                content: "App events",
                fontColor: palette.text.data
            }
        ]
    };
}
