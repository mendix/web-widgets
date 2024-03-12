import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { action, computed, configure, makeObservable, observable } from "mobx";
import {
    ColumnsSortingStore,
    IColumnSortingStore,
    sortInstructionsToSortRules,
    sortRulesToSortInstructions
} from "./ColumnsSortingStore";
import { ColumnStore, IColumnStore } from "./column/ColumnStore";
import { FilterCondition } from "mendix/filters";
import { SortInstruction, SortRule } from "../../typings/sorting";
import { ColumnId } from "../../typings/GridColumn";
import { ColumnSettingsExtended } from "./GridSettingsStore";
import { ColumnFilterStore } from "./column/ColumnFilterStore";

configure({ isolateGlobalState: true });

export interface IColumnsStore {
    // static props
    dragEnabled: boolean;
    filterEnabled: boolean;
    hideEnabled: boolean;
    resizeEnabled: boolean;
    sortEnabled: boolean;

    loaded: boolean;

    availableColumns: IColumnStore[];
    visibleColumns: IColumnStore[];

    columnFilters: ColumnFilterStore[];

    updateProps(props: DatagridContainerProps["columns"]): void;

    swapColumns(columnIdA: ColumnId, columnIdB: ColumnId): void;
    createSizeSnapshot(): void;
}

export interface IColumnParentStore {
    isLastVisible(column: ColumnStore): boolean;
    sorting: IColumnSortingStore;
}

export class ColumnsStore implements IColumnsStore, IColumnParentStore {
    readonly _allColumns: ColumnStore[];
    readonly _allColumnsById: Map<ColumnId, ColumnStore> = new Map();

    readonly columnFilters: ColumnFilterStore[];

    sorting: ColumnsSortingStore;

    dragEnabled: boolean;
    filterEnabled: boolean;
    hideEnabled: boolean;
    resizeEnabled: boolean;
    sortEnabled: boolean;

    constructor(props: DatagridContainerProps) {
        this.dragEnabled = props.columnsDraggable;
        this.filterEnabled = props.columnsFilterable;
        this.hideEnabled = props.columnsHidable;
        this.resizeEnabled = props.columnsResizable;
        this.sortEnabled = props.columnsSortable;

        this._allColumns = [];
        this.columnFilters = [];

        props.columns.forEach((columnProps, i) => {
            const column = new ColumnStore(i, columnProps, this);
            this._allColumnsById.set(column.columnId, column);
            this._allColumns[i] = column;

            this.columnFilters[i] = new ColumnFilterStore(columnProps, props.datasource.filter);
        });

        this.sorting = new ColumnsSortingStore(
            sortInstructionsToSortRules(props.datasource.sortOrder, this._allColumns)
        );

        makeObservable<ColumnsStore, "_allColumns" | "_allColumnsOrdered">(this, {
            _allColumns: observable,

            loaded: computed,
            _allColumnsOrdered: computed,
            availableColumns: computed,
            visibleColumns: computed,
            filterConditions: computed.struct,
            columnsSettings: computed.struct,

            updateProps: action,
            createSizeSnapshot: action,
            swapColumns: action,
            applyColumnsSettings: action
        });
    }

    updateProps(props: DatagridContainerProps["columns"]): void {
        props.forEach((columnProps, i) => {
            this._allColumns[i].updateProps(columnProps);
            this.columnFilters[i].updateProps(columnProps);
        });

        if (this.visibleColumns.length < 1) {
            // if all columns are hidden after the update - reset hidden state HERE
            console.warn("All columns are hidden, resetting hidden state");
            this._allColumns.forEach(c => {
                c.isHidden = true;
            });
        }
    }

    swapColumns(columnIdA: ColumnId, columnIdB: ColumnId): void {
        const columnA = this._allColumnsById.get(columnIdA)!;
        const columnB = this._allColumnsById.get(columnIdB)!;

        [columnA.orderWeight, columnB.orderWeight] = [columnB.orderWeight, columnA.orderWeight];
    }

    createSizeSnapshot(): void {
        this._allColumns.forEach(c => c.takeSizeSnapshot());
    }

    get loaded(): boolean {
        // check if all columns loaded, then we can render
        return this._allColumns.every(c => c.loaded);
    }

    private get _allColumnsOrdered(): ColumnStore[] {
        return [...this._allColumns].sort((columnA, columnB) => columnA.orderWeight - columnB.orderWeight);
    }

    get availableColumns(): ColumnStore[] {
        // columns that are not hidden by visibility expression
        // visible field name is misleading, it means available
        return [...this._allColumnsOrdered].filter(column => column.isAvailable);
    }

    get visibleColumns(): ColumnStore[] {
        // list of columns that are available and not in the set of hidden columns
        return [...this.availableColumns].filter(column => !column.isHidden);
    }

    get filterConditions(): FilterCondition[] {
        return this.columnFilters
            .map(cf => cf.condition)
            .filter((filter): filter is FilterCondition => filter !== undefined);
    }

    get sortInstructions(): SortInstruction[] | undefined {
        return sortRulesToSortInstructions(this.sorting.rules, this._allColumns);
    }

    get columnsSettings(): ColumnSettingsExtended[] {
        return this._allColumns.map(column => {
            return {
                columnId: column.columnId,
                size: column.size,
                hidden: column.isHidden,
                orderWeight: column.orderWeight,
                sortDir: column.sortDir,
                sortWeight: column.sortWeight,
                filterSettings: undefined
            };
        });
    }
    applyColumnsSettings(settings: ColumnSettingsExtended[]): void {
        settings.forEach(conf => {
            const cId = conf.columnId;
            const column = this._allColumnsById.get(cId);
            if (!column) {
                console.warn(`Error while restoring personalization config. Column '${cId}' is not found.`);
                return;
            }

            // size
            column.size = conf.size;

            // hidden
            column.isHidden = conf.hidden;

            // order
            column.orderWeight = conf.orderWeight * 10;
        });

        this.sorting.rules = settings
            .filter(s => s.sortDir && s.sortWeight !== undefined)
            .sort((a, b) => a.sortWeight! - b.sortWeight!)
            .map(c => [c.columnId, c.sortDir!] as SortRule);
    }

    isLastVisible(column: ColumnStore): boolean {
        return this.visibleColumns.at(-1) === column;
    }
}
