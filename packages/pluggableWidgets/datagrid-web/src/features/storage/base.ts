import { GridSettings } from "../../typings/GridSettings";

export interface SettingsStorage {
    save(settings: GridSettings): void;
    load(): GridSettings | undefined;
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
