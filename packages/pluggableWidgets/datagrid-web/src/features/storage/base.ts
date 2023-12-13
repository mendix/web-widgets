import { GridSettings } from "../../typings/GridSettings";

export interface SettingsStorage {
    save(settings: GridSettings): void;
    load(): GridSettings | undefined;
    reset(): void;
}

export type StorageReady = { status: "ready"; value: SettingsStorage };

export type StoragePending = { status: "pending"; value: null };

export type StorageDisabled = { status: "disabled"; value: null; reason: string };

export type StorageDone = StorageReady | StorageDisabled;

export type DynamicStorage = StorageReady | StoragePending | StorageDisabled;
