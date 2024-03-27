import { Properties, hidePropertiesIn } from "@mendix/pluggable-widgets-tools";
import {
    StructurePreviewProps,
    structurePreviewPalette,
    rowLayout,
    container,
    svgImage,
    text
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
    const eventsCount = getEventsCount(values);

    const palette = structurePreviewPalette[isDarkMode ? "dark" : "light"];
    const activeSVG = isDarkMode ? EventsPreviewDarkSVGActive : EventsPreviewSVGActive;
    const normalSVG = isDarkMode ? EventsPreviewDarkSVG : EventsPreviewSVG;
    const variant = eventsCount > 0 ? activeSVG : normalSVG;
    const doc = decodeURIComponent(variant.replace("data:image/svg+xml,", ""));

    return rowLayout({ columnSize: "grow", borders: true, backgroundColor: palette.background.containerFill })(
        container()(),
        rowLayout({ grow: 2, padding: 8 })(
            svgImage(doc, 15, 15),
            text({ fontColor: palette.text.primary, grow: 10 })(getCaption(eventsCount))
        ),
        container()()
    );
}

export function getCustomCaption(values: EventsPreviewProps, _platform = "desktop"): string {
    const caption = getCaption(getEventsCount(values));
    return caption;
}

export function getEventsCount(values: EventsPreviewProps): number {
    return Number(!!values.onComponentLoad) + Number(!!values.onEventChange);
}

export function getCaption(eventsCount: number): string {
    return eventsCount <= 0 ? "[Configure events]" : `[${eventsCount}] Event${eventsCount > 1 ? "s" : ""}`;
}
