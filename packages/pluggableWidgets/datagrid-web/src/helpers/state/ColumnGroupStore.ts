import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { action, computed, configure, makeObservable, observable } from "mobx";
import {
    ColumnsSortingStore,
    IColumnSortingStore,
    sortInstructionsToSortRules,
    sortRulesToSortInstructions
} from "./ColumnsSortingStore";
import { ColumnStore } from "./column/ColumnStore";
import { FilterCondition } from "mendix/filters";
import { SortInstruction } from "../../typings/sorting";
import { ColumnId, GridColumn } from "../../typings/GridColumn";
import { ColumnFilterStore } from "./column/ColumnFilterStore";
import { ColumnPersonalizationSettings } from "../../typings/personalization-settings";

configure({ isolateGlobalState: true });

export interface IColumnGroupStore {
    loaded: boolean;

    availableColumns: GridColumn[];
    visibleColumns: GridColumn[];

    columnFilters: ColumnFilterStore[];

    swapColumns(source: ColumnId, target: [ColumnId, "after" | "before"]): void;
    createSizeSnapshot(): void;
}

export interface IColumnParentStore {
    isLastVisible(column: ColumnStore): boolean;
    sorting: IColumnSortingStore;
}

export class ColumnGroupStore implements IColumnGroupStore, IColumnParentStore {
    readonly _allColumns: ColumnStore[];
    readonly _allColumnsById: Map<ColumnId, ColumnStore> = new Map();

    readonly columnFilters: ColumnFilterStore[];

    sorting: ColumnsSortingStore;

    constructor(props: Pick<DatagridContainerProps, "columns" | "datasource">) {
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

        makeObservable<ColumnGroupStore, "_allColumns" | "_allColumnsOrdered">(this, {
            _allColumns: observable,

            loaded: computed,
            _allColumnsOrdered: computed,
            availableColumns: computed,
            visibleColumns: computed,
            filterConditions: computed.struct,
            settings: computed.struct,

            updateProps: action,
            createSizeSnapshot: action,
            swapColumns: action,
            applySettings: action
        });
    }

    updateProps(props: Pick<DatagridContainerProps, "columns">): void {
        props.columns.forEach((columnProps, i) => {
            this._allColumns[i].updateProps(columnProps);
            this.columnFilters[i].updateProps(columnProps);
        });

        if (this.visibleColumns.length < 1) {
            // if all columns are hidden after the update - reset hidden state HERE
            console.warn("All columns are hidden, resetting hidden state");
            this._allColumns.forEach(c => {
                c.isHidden = false;
            });
        }
    }

    swapColumns(source: ColumnId, [target, placement]: [ColumnId, "after" | "before"]): void {
        const columnSource = this._allColumnsById.get(source)!;
        const columnTarget = this._allColumnsById.get(target)!;
        columnSource.orderWeight = columnTarget.orderWeight + (placement === "after" ? 1 : -1);

        // normalize columns
        this._allColumnsOrdered.forEach((column, idx) => {
            column.orderWeight = idx * 10;
        });
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

    get settings(): ColumnPersonalizationSettings[] {
        return this._allColumns.map(column => column.settings);
    }
    applySettings(settings: ColumnPersonalizationSettings[]): void {
        settings.forEach(conf => {
            const column = this._allColumnsById.get(conf.columnId);
            if (!column) {
                console.warn(`Error while restoring personalization config. Column '${conf.columnId}' is not found.`);
                return;
            }
            column.applySettings(conf);
        });

        this.sorting.rules = settings
            .filter(s => s.sortDir && s.sortWeight !== undefined)
            .sort((a, b) => a.sortWeight! - b.sortWeight!)
            .map(c => [c.columnId, c.sortDir!]);
    }

    isLastVisible(column: ColumnStore): boolean {
        return this.visibleColumns.at(-1) === column;
    }
}
