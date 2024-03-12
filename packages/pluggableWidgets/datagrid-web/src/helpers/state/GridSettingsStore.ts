import { SortDirection, SortRule } from "../../typings/GridModel";
import { ColumnId } from "../../typings/GridColumn";
import { action, computed, makeObservable, observable, reaction } from "mobx";
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

export interface ColumnSettingsExtended extends ColumnSettings {
    orderWeight: number;
    sortDir: SortDirection | undefined;
    sortWeight: number | undefined;
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

    constructor(props: DatagridContainerProps, private columnsStore: ColumnsStore) {
        this.gridName = props.name;
        this.storageAttr = props.configurationAttribute;

        makeObservable<GridSettingsStore, "storageAttr" | "storedSettings" | "applySettings">(this, {
            storageAttr: observable.ref,

            storedSettings: computed,
            settings: computed,

            applySettings: action,
            updateProps: action
        });

        reaction(
            () => this.storedSettings,
            settings => {
                if (settings !== undefined && JSON.stringify(settings) !== JSON.stringify(this.settings)) {
                    this.applySettings(settings);
                }
            }
        );

        reaction(
            () => this.settings,
            settings => {
                if (this.storageAttr && !this.storageAttr.readOnly) {
                    if (JSON.stringify(this.storedSettings) !== JSON.stringify(settings)) {
                        this.storageAttr.setValue(JSON.stringify(settings));
                    }
                }
            }
        );
    }

    get storedSettings(): GridSettings | undefined {
        if (this.storageAttr && this.storageAttr.status === ValueStatus.Available && this.storageAttr.value) {
            return JSON.parse(this.storageAttr.value) as unknown as GridSettings;
        }
    }

    updateProps(props: DatagridContainerProps): void {
        this.storageAttr = props.configurationAttribute;
    }

    private applySettings(settings: GridSettings): void {
        const configs: ColumnSettingsExtended[] = settings.columns.map(c => {
            const sortIndex = settings.sortOrder.findIndex(s => s[0] === c.columnId);

            return {
                columnId: c.columnId,
                size: c.size,
                hidden: c.hidden,

                orderWeight: settings.columnOrder.indexOf(c.columnId),

                sortWeight: sortIndex !== -1 ? sortIndex + 1 : undefined,
                sortDir: sortIndex !== -1 ? settings.sortOrder[sortIndex]?.[1] : undefined,

                filterSettings: undefined
            };
        });

        this.columnsStore.applyColumnsSettings(configs);
    }

    get settings(): GridSettings {
        const columns = this.columnsStore.columnsSettings;

        const sortOrder = columns
            .filter(c => c.sortDir && c.sortWeight !== undefined)
            .sort((a, b) => a.sortWeight! - b.sortWeight!)
            .map(c => [c.columnId!, c.sortDir!] as SortRule);

        const columnOrder = [...columns].sort((a, b) => a.orderWeight - b.orderWeight).map(c => c.columnId);

        return {
            name: this.gridName,
            schemaVersion: 2,
            settingsHash: getHash(this.columnsStore._allColumns, this.gridName),
            columns: columns.map(c => ({
                columnId: c.columnId,
                size: c.size,
                hidden: c.hidden,
                filterSettings: undefined
            })),
            sortOrder,
            columnOrder
        };
    }
}
