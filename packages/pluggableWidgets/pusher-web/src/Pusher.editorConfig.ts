import { Problem, Properties } from "@mendix/pluggable-widgets-tools";
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

export function check(values: PusherPreviewProps): Problem[] {
    const errors: Problem[] = [];

    // Check for duplicate action names
    if (values.eventHandlers && values.eventHandlers.length > 0) {
        const actionNames = values.eventHandlers.map(handler => handler.actionName).filter(name => name);
        const duplicates = actionNames.filter((name, index) => actionNames.indexOf(name) !== index);

        if (duplicates.length > 0) {
            const uniqueDuplicates = Array.from(new Set(duplicates));
            errors.push({
                property: "eventHandlers",
                message: `Duplicate action names found: ${uniqueDuplicates.join(", ")}. Each action name must be unique.`
            });
        }
    }

    return errors;
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
    const handlerCount = values.eventHandlers?.length ?? 0;
    return handlerCount > 0 ? `Pusher widget [${handlerCount} handler${handlerCount > 1 ? "s" : ""}]` : "Pusher widget";
}
