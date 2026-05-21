import { Properties } from "@mendix/pluggable-widgets-tools";
import {
    container,
    rowLayout,
    structurePreviewPalette,
    StructurePreviewProps,
    text
} from "@mendix/widget-plugin-platform/preview/structure-preview-api";
import { PusherPreviewProps } from "../typings/PusherProps";

export function getProperties(_values: PusherPreviewProps, defaultProperties: Properties): Properties {
    return defaultProperties;
}

export function getPreview(values: PusherPreviewProps, isDarkMode: boolean): StructurePreviewProps {
    const palette = structurePreviewPalette[isDarkMode ? "dark" : "light"];

    return rowLayout({ columnSize: "grow", borders: true, backgroundColor: palette.background.containerFill })(
        container()(),
        rowLayout({ grow: 2, padding: 8 })(text({ fontColor: palette.text.primary, grow: 10 })(getCaption(values))),
        container()()
    );
}

export function getCustomCaption(values: PusherPreviewProps): string {
    return getCaption(values);
}

export function getCaption(values: PusherPreviewProps): string {
    return `Pusher widget [${values.notifyChannelName}]`;
}
