import { GalleryGateProps } from "../../typings/GalleryGateProps";

export interface GallerySettingsConfig {
    storeFilters: boolean;
    storeSort: boolean;
    settingsSyncEnabled: boolean;
}

export function settingsConfig(props: GalleryGateProps): GallerySettingsConfig {
    return Object.freeze<GallerySettingsConfig>({
        storeFilters: props.storeFilters,
        storeSort: props.storeSort,
        settingsSyncEnabled: isSettingsSyncEnabled(props)
    });
}

function isSettingsSyncEnabled(props: GalleryGateProps): boolean {
    switch (props.stateStorageType) {
        case "localStorage": {
            return true;
        }
        case "attribute": {
            return props.stateStorageAttr !== undefined;
        }
        default:
            return false;
    }
}
