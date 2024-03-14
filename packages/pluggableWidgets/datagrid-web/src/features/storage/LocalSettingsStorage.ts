import { GridPersonalizationStorageSettings } from "../../typings/personalization-settings";
import { SettingsStorage } from "./base";

export class LocalSettingsStorage implements SettingsStorage {
    constructor(private key: string) {}

    load(): GridPersonalizationStorageSettings | undefined {
        const data = localStorage.getItem(this.key);

        return data ? JSON.parse(data) : undefined;
    }

    save(data: GridPersonalizationStorageSettings): void {
        localStorage.setItem(this.key, JSON.stringify(data));
    }

    reset(): void {
        localStorage.removeItem(this.key);
    }
}
