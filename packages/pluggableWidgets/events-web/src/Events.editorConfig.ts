import { Properties, hidePropertiesIn } from "@mendix/pluggable-widgets-tools";
import {
    StructurePreviewProps,
    structurePreviewPalette
} from "@mendix/widget-plugin-platform/preview/structure-preview-api";
import { EventsPreviewProps } from "../typings/EventsProps";

import EventsPreviewSVGActive from "./assets/Events.icon.active.svg";
import EventsPreviewSVG from "./assets/Events.icon.svg";
import EventsPreviewDarkSVGActive from "./assets/Events.icon.dark.active.svg";
import EventsPreviewDarkSVG from "./assets/Events.icon.dark.svg";

export function getProperties(
    values: EventsPreviewProps,
    defaultProperties: Properties /* , target: Platform*/
): Properties {
    if (!values.componentLoadRepeat) {
        hidePropertiesIn(defaultProperties, values, ["componentLoadRepeatInterval"]);
    }
    return defaultProperties;
}

export function getPreview(values: EventsPreviewProps, isDarkMode: boolean): StructurePreviewProps {
    const eventsCount = Number(!!values.onComponentLoad) + Number(!!values.onEventChange);

    const palette = structurePreviewPalette[isDarkMode ? "dark" : "light"];
    const activeSVG = isDarkMode ? EventsPreviewDarkSVGActive : EventsPreviewSVGActive;
    const normalSVG = isDarkMode ? EventsPreviewDarkSVG : EventsPreviewSVG;
    const variant = eventsCount > 0 ? activeSVG : normalSVG;
    const doc = decodeURIComponent(variant.replace("data:image/svg+xml,", ""));

    return {
        type: "RowLayout",
        columnSize: "grow",
        borders: true,
        backgroundColor: palette.background.containerFill,
        children: [
            {
                type: "Container"
            },
            {
                type: "RowLayout", // fills space on the right
                grow: 2,
                padding: 8,
                children: [
                    {
                        type: "Image",
                        document: doc,
                        height: 15,
                        grow: 1,
                        width: 15
                    },
                    {
                        type: "Text",
                        content:
                            eventsCount <= 0
                                ? "[Configure events]"
                                : `[${eventsCount}] Event${eventsCount > 1 ? "s" : ""}`,
                        fontColor: palette.text.primary,
                        grow: 10
                    }
                ]
            },
            {
                type: "Container"
            }
        ]
    };
}

export function getCustomCaption(values: EventsPreviewProps, _platform = "desktop"): string {
    const eventsCount = Number(!!values.onComponentLoad) + Number(!!values.onEventChange);

    return eventsCount <= 0 ? "[Configure events]" : `[${eventsCount}] Event${eventsCount > 1 ? "s" : ""}`;
}
