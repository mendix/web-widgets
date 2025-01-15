import { disposeFx } from "@mendix/widget-plugin-filtering/mobx-utils";
import { FiltersSettingsMap } from "@mendix/widget-plugin-filtering/typings/settings";
import { FilterCondition } from "mendix/filters";
import { action, computed, makeObservable, observable } from "mobx";
import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { ColumnId, GridColumn } from "../../typings/GridColumn";
import { ColumnFilterSettings, ColumnPersonalizationSettings } from "../../typings/personalization-settings";
import { SortInstruction } from "../../typings/sorting";
import { StaticInfo } from "../../typings/static-info";
import {
    ColumnsSortingStore,
    IColumnSortingStore,
    sortInstructionsToSortRules,
    sortRulesToSortInstructions
} from "./ColumnsSortingStore";
import { ColumnFilterStore } from "./column/ColumnFilterStore";
import { ColumnStore } from "./column/ColumnStore";

export interface IColumnGroupStore {
    loaded: boolean;

    availableColumns: GridColumn[];
    visibleColumns: GridColumn[];

    columnFilters: ColumnFilterStore[];

    swapColumns(source: ColumnId, target: [ColumnId, "after" | "before"]): void;
    setIsResizing(status: boolean): void;
}

export interface IColumnParentStore {
    isLastVisible(column: ColumnStore): boolean;
    isResizing: boolean;
    sorting: IColumnSortingStore;
}

export class ColumnGroupStore implements IColumnGroupStore, IColumnParentStore {
    readonly _allColumns: ColumnStore[];
    readonly _allColumnsById: Map<ColumnId, ColumnStore> = new Map();

    readonly columnFilters: ColumnFilterStore[];

    sorting: ColumnsSortingStore;
    isResizing: boolean = false;

    constructor(
        props: Pick<DatagridContainerProps, "columns" | "datasource">,
        info: StaticInfo,
        dsViewState: Array<FilterCondition | undefined> | null
    ) {
        this._allColumns = [];
        this.columnFilters = [];

        props.columns.forEach((columnProps, i) => {
            const initCond = dsViewState?.at(i) ?? null;
            const column = new ColumnStore(i, columnProps, this);
            this._allColumnsById.set(column.columnId, column);
            this._allColumns[i] = column;
            this.columnFilters[i] = new ColumnFilterStore(columnProps, info, initCond);
        });

        this.sorting = new ColumnsSortingStore(
            sortInstructionsToSortRules(props.datasource.sortOrder, this._allColumns)
        );

        makeObservable<ColumnGroupStore, "_allColumns" | "_allColumnsOrdered">(this, {
            _allColumns: observable,
            isResizing: observable,

            loaded: computed,
            _allColumnsOrdered: computed,
            availableColumns: computed,
            visibleColumns: computed,
            conditions: computed.struct,
            columnSettings: computed.struct,
            filterSettings: computed({ keepAlive: true }),
            updateProps: action,
            setIsResizing: action,
            swapColumns: action,
            setColumnSettings: action
        });
    }

    setup(): () => void {
        const [disposers, dispose] = disposeFx();
        for (const filter of this.columnFilters) {
            disposers.push(filter.setup());
        }
        return dispose;
    }

    updateProps(props: Pick<DatagridContainerProps, "columns">): void {
        props.columns.forEach((columnProps, i) => {
            this._allColumns[i].updateProps(columnProps);
            this.columnFilters[i].updateProps(columnProps);
        });

        if (this.visibleColumns.length < 1) {
            // if all columns are hidden after the update - reset hidden state for all columns
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

    setIsResizing(status: boolean): void {
        this.isResizing = status;

        if (this.isResizing) {
            this._allColumns.forEach(c => c.takeSizeSnapshot());
        }
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

    get conditions(): Array<FilterCondition | undefined> {
        return this.columnFilters.map((store, index) => {
            return this._allColumns[index].isHidden ? undefined : store.condition2;
        });
    }

    get sortInstructions(): SortInstruction[] | undefined {
        return sortRulesToSortInstructions(this.sorting.rules, this._allColumns);
    }

    get columnSettings(): ColumnPersonalizationSettings[] {
        return this._allColumns.map(column => column.settings);
    }

    get filterSettings(): FiltersSettingsMap<ColumnId> {
        return this.columnFilters.reduce<FiltersSettingsMap<ColumnId>>((acc, filter, index) => {
            if (filter.settings) {
                acc.set(this._allColumns[index].columnId, filter.settings);
            }
            return acc;
        }, new Map());
    }

    setColumnSettings(settings: ColumnPersonalizationSettings[]): void {
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

    setColumnFilterSettings(values: ColumnFilterSettings): void {
        for (const [id, data] of values) {
            const filterIndex = this._allColumnsById.get(id as ColumnId)?.columnIndex ?? NaN;
            const filter = this.columnFilters.at(filterIndex);
            if (filter) {
                filter.settings = data;
            }
        }
    }

    isLastVisible(column: ColumnStore): boolean {
        return this.visibleColumns.at(-1) === column;
    }
}
