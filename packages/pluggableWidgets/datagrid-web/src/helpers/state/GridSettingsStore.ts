import { SortRule } from "../../typings/GridModel";
import { ColumnId } from "../../typings/GridColumn";
import { action, autorun, computed, makeObservable, observable } from "mobx";
import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { getHash } from "../../features/model/utils";
import { ColumnsStore } from "./ColumnsStore";
import { EditableValue, ValueStatus } from "mendix";

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

    private storageAttr: EditableValue<string> | undefined;
    private storedSettings: GridSettings | undefined = undefined;

    constructor(props: DatagridContainerProps, private columnsStore: ColumnsStore) {
        this.gridName = props.name;
        this.storageAttr = props.configurationAttribute;

        makeObservable<GridSettingsStore, "storageAttr" | "storedSettings" | "applySettings" | "readStorageData">(
            this,
            {
                storageAttr: observable.ref,
                storedSettings: observable.struct,
                settingsData: computed,

                readStorageData: action,
                applySettings: action,
                updateProps: action
            }
        );

        // todo: dispose those autoruns on unmount
        autorun(() => {
            if (this.storageAttr && this.storageAttr.status === ValueStatus.Available) {
                this.readStorageData(this.storageAttr.value);
            }
        });

        autorun(() => {
            if (this.storedSettings !== undefined) {
                this.applySettings(this.storedSettings);
            }
        });

        autorun(() => {
            if (this.storageAttr && !this.storageAttr.readOnly) {
                this.storageAttr.setValue(this.settingsData);
            }
        });
    }

    updateProps(props: DatagridContainerProps): void {
        this.storageAttr = props.configurationAttribute;
    }

    private applySettings(settings: GridSettings): void {
        this.columnsStore.sorting.fromConfig(settings.sortOrder);
        this.columnsStore.visual.applyColumnSettings(settings.columns, settings.columnOrder);
    }

    private readStorageData(storageData: string | undefined): void {
        // todo: handle old settings formats
        if (storageData) {
            this.storedSettings = JSON.parse(storageData) as unknown as GridSettings;
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
