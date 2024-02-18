import { SortRule } from "../../typings/GridModel";
import { ColumnId } from "../../typings/GridColumn";
import { action, autorun, computed, makeObservable, observable } from "mobx";
import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { getHash } from "../../features/model/utils";
import { ColumnsStore } from "./ColumnsStore";

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
    private gridName: string;
    private storageData: GridSettings | undefined = undefined;

    constructor(props: DatagridContainerProps, private columnsStore: ColumnsStore) {
        this.gridName = props.name;

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

    private setSettings(settings: GridSettings): void {
        this.columnsStore.sorting.fromConfig(settings.sortOrder);
        this.columnsStore.visual.applyColumnSettings(settings.columns, settings.columnOrder);
    }

    setStorageData(storageData: string | undefined): void {
        if (storageData) {
            this.storageData = JSON.parse(storageData) as unknown as GridSettings;
        }
    }

    get settings(): GridSettings {
        const sortOrder = this.columnsStore.sorting.config;
        const [columns, columnOrder] = this.columnsStore.visual.columnSettings;

        return {
            name: this.gridName,
            schemaVersion: 2,
            settingsHash: getHash(this.columnsStore._allColumns, this.gridName),
            columns,
            sortOrder,
            columnOrder
        };
    }

    get settingsData(): string {
        return JSON.stringify(this.settings);
    }
}
