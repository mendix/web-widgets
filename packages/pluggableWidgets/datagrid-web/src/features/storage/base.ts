import { GridPersonalizationStorageSettings } from "../../typings/personalization-settings";

export interface SettingsStorage {
    save(settings: GridPersonalizationStorageSettings): void;
    load(): GridPersonalizationStorageSettings | undefined;
    reset(): void;
}

export type SettingsClient =
    | {
          status: "loading" | "unavailable";
          settings: undefined;
      }
    | {
          status: "available";
          settings: SettingsStorage;
      };
