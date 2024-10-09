import { PersonalizationStorage } from "./PersonalizationStorage";

export class LocalStoragePersonalizationStorage implements PersonalizationStorage {
    constructor(private key: string) {}

    get settings(): unknown {
        const data = localStorage.getItem(this.key);

        return data ? JSON.parse(data) : undefined;
    }

    updateSettings(newSettings: any): void {
        const newSettingsJson = JSON.stringify(newSettings);
        if (localStorage.getItem(this.key) !== newSettingsJson) {
            localStorage.setItem(this.key, newSettingsJson);
        }
    }
}
