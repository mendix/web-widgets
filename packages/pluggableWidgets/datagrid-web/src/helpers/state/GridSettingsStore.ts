import { SortRule } from "../../typings/GridModel";
import { ColumnId } from "../../typings/GridColumn";
import { ColumnsVisualStore } from "./ColumnsVisualStore";
import { ColumnsSortingStore } from "./ColumnsSortingStore";
import { action, autorun, computed, makeObservable, observable } from "mobx";

export interface ColumnSettings {
    columnId: ColumnId;
    size: number | undefined;
    hidden: boolean;
    filterSettings: unknown;
}

export interface GridSettings {
    name: string;
    schemaVersion: number;
    settingsHash: string;

    columns: ColumnSettings[];
    sortOrder: SortRule[];
    columnOrder: ColumnId[];
}

export class GridSettingsStore {
    private storageData: GridSettings | undefined = undefined;

    constructor(private visualState: ColumnsVisualStore, private sortingState: ColumnsSortingStore) {
        makeObservable<GridSettingsStore, "storageData" | "setSettings">(this, {
            storageData: observable.struct,
            settingsData: computed,

            setStorageData: action,
            setSettings: action
        });

        autorun(() => {
            if (this.storageData !== undefined) {
                this.setSettings(this.storageData);
            }
        });
    }

    private setSettings(settings: GridSettings) {
        this.sortingState.fromConfig(settings.sortOrder);
        this.visualState.applyColumnSettings(settings.columns, settings.columnOrder);
    }

    setStorageData(storageData: string | undefined) {
        if (storageData) {
            this.storageData = JSON.parse(storageData) as unknown as GridSettings;
        }
    }

    get settings(): GridSettings {
        const sortOrder = this.sortingState.config;
        const [columns, columnOrder] = this.visualState.columnSettings;

        return {
            // TODO: fix me
            name: "grid1",
            schemaVersion: 1,
            settingsHash: "abc123",
            columns,
            sortOrder,
            columnOrder
        };
    }

    get settingsData(): string {
        return JSON.stringify(this.settings);
    }
}
