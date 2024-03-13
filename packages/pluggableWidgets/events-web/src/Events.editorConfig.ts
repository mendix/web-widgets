import { Properties, hidePropertiesIn } from "@mendix/pluggable-widgets-tools";
import { EventsPreviewProps } from "../typings/EventsProps";
import {
    StructurePreviewProps,
    structurePreviewPalette
} from "@mendix/widget-plugin-platform/preview/structure-preview-api";

import EventsPreviewSVG from "./assets/Events.icon.svg";
import EventsPreviewSVGActive from "./assets/Events.icon.active.svg";

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

    const variant = eventsCount > 0 ? EventsPreviewSVGActive : EventsPreviewSVG;
    const doc = decodeURIComponent(variant.replace("data:image/svg+xml,", ""));

    return {
        type: "RowLayout",
        columnSize: "grow",
        borders: true,
        backgroundColor: eventsCount <= 0 ? palette.background.container : palette.background.containerDisabled,
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
                        content: eventsCount <= 0 ? "[Configure events]" : `[${eventsCount}] Events`,
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

    return eventsCount <= 0 ? "[Configure events]" : `[${eventsCount}] Events`;
}
