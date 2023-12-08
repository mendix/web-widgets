import { GridSettings } from "./GridSettings";

export interface SettingsStorage {
    save(settings: GridSettings): void;
    load(): GridSettings | undefined;
    reset(): void;
}
