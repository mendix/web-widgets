import { SelectionMode, SelectionType } from "@mendix/widget-plugin-grid/selection";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { GalleryContainerProps } from "../../../typings/GalleryProps";

export interface GalleryConfig {
    id: string;
    name: string;
    // datasource
    refreshIntervalMs: number;
    // selection
    selectionEnabled: boolean;
    selectionType: SelectionType;
    selectionMode: SelectionMode;
    keepSelection: boolean;
    autoSelect: boolean;
    // settings
    settingsStorageEnabled: boolean;
    // grid settings
    desktopItems: number;
    tabletItems: number;
    phoneItems: number;
    filtersChannelName: string;
}

export function galleryConfig(props: GalleryContainerProps): GalleryConfig {
    const id = `${props.name}:Gallery@${generateUUID()}`;

    return {
        id,
        name: props.name,
        refreshIntervalMs: 0,
        selectionEnabled: isSelectionEnabled(props),
        selectionType: selectionType(props),
        selectionMode: props.itemSelectionMode,
        keepSelection: props.keepSelection,
        autoSelect: props.autoSelect,
        settingsStorageEnabled: false,
        desktopItems: props.desktopItems,
        tabletItems: props.tabletItems,
        phoneItems: props.phoneItems,
        filtersChannelName: `${id}:events`
    };
}

function isSelectionEnabled(props: GalleryContainerProps): boolean {
    return props.itemSelection !== undefined;
}

function selectionType(props: GalleryContainerProps): SelectionType {
    return props.itemSelection ? props.itemSelection.type : "None";
}
