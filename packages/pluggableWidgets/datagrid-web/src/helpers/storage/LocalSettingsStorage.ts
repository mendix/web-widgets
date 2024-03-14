import { GridPersonalizationStorageSettings } from "../../typings/personalization-settings";
import { PersonalizationStorage } from "./PersonalizationStorage";
import { DatagridContainerProps } from "../../../typings/DatagridProps";

export class LocalSettingsStorage implements PersonalizationStorage {
    constructor(private key: string) {}

    get storedSettings(): GridPersonalizationStorageSettings | undefined {
        const data = localStorage.getItem(this.key);

        return data ? JSON.parse(data) : undefined;
    }

    storeSettings(newSettings: GridPersonalizationStorageSettings): void {
        const newSettingsJson = JSON.stringify(newSettings);
        if (localStorage.getItem(this.key) !== newSettingsJson) {
            localStorage.setItem(this.key, newSettingsJson);
        }
    }

    updateProps(_props: DatagridContainerProps): void {}
}
