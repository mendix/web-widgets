import { GridSettings } from "../../typings/GridSettings";
import { SettingsStorage } from "./base";

export class LocalSettingsStorage implements SettingsStorage {
    constructor(private key: string) {}

    load(): GridSettings | undefined {
        const data = localStorage.getItem(this.key);

        return data ? JSON.parse(data) : undefined;
    }

    save(data: GridSettings): void {
        localStorage.setItem(this.key, JSON.stringify(data));
    }

    reset(): void {
        localStorage.removeItem(this.key);
    }
}
