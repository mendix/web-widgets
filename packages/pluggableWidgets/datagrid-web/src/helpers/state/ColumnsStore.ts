// state of data grid

// datasource
// manage filters, sorting and pagination

// columns
// manage available columns, hiding, reordering
// facts:
// array of columns is always available, always have all columns
// static properties can't change, so we calculate some hash on them
// visible might be loading or not available, this makes the column unavailable next to "false"
// header might be loading or unavailable, still possible to render without it
// column contains some filtering stuff, not sure how it is used yet
// one of the columns have to always stay visible
//
// when external factors show or hide columns (via visibility) so that nothing is visible - show all columns
// Fields needed for columns
// - allColumns (all columns array)
// - availableColumns (calculated array)
// - visibleColumns (calculated array)
// - hiddenColumnIds (set of columns explicitly hidden by the user)
// - columnsOrder (array of columnsIds showing the order in which they have to be represented)
// - size (Record columnId to number showing explicitly set column sizes)

import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { action, computed, makeObservable, observable, configure } from "mobx";
import { ColumnsSortingStore } from "./ColumnsSortingStore";
import { ColumnsVisualStore, IColumnsVisualStore } from "./ColumnsVisualStore";
import { ColumnStore, IColumnStore } from "./column/ColumnStore";
import { FilterCondition } from "mendix/filters";
import { SortInstruction } from "../../typings/GridModel";

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

    // nester stores
    visual: IColumnsVisualStore;

    updateProps(props: DatagridContainerProps["columns"]): void;
}

export class ColumnsStore implements IColumnsStore {
    readonly _allColumns: ColumnStore[];

    visual: ColumnsVisualStore;
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

        this._allColumns = props.columns.map((columnProps, i) => {
            return new ColumnStore(columnProps, i, this, props.datasource.filter);
        });

        this.visual = new ColumnsVisualStore(this._allColumns);
        this.sorting = new ColumnsSortingStore(this._allColumns, props.datasource.sortOrder);

        makeObservable<ColumnsStore, "_allColumns" | "_allColumnsOrdered">(this, {
            _allColumns: observable,

            loaded: computed,
            _allColumnsOrdered: computed,
            availableColumns: computed,
            visibleColumns: computed,
            filterConditions: computed.struct,

            updateProps: action
        });
    }

    updateProps(props: DatagridContainerProps["columns"]): void {
        props.forEach((columnProps, i) => {
            this._allColumns[i].updateProps(columnProps);
        });

        if (this.visibleColumns.length < 1) {
            // if all columns are hidden after the update - reset hidden state HERE
            console.warn("All columns are hidden, resetting hidden state");
            this.visual.showAll();
        }
    }

    get loaded(): boolean {
        // check if all columns loaded, then we can render
        return this._allColumns.every(c => c.loaded);
    }

    private get _allColumnsOrdered(): ColumnStore[] {
        return [...this._allColumns].sort(
            (columnA, columnB) =>
                this.visual.getColumnOrderWeight(columnA.columnId)! -
                this.visual.getColumnOrderWeight(columnB.columnId)!
        );
    }

    get availableColumns(): ColumnStore[] {
        // columns that are not hidden by visibility expression
        // visible field name is misleading, it means available
        return [...this._allColumnsOrdered].filter(column => column.isAvailable);
    }

    get visibleColumns(): ColumnStore[] {
        // list of columns that are available and not in the set of hidden columns
        return [...this.availableColumns].filter(column => !this.visual.columnHidden.has(column.columnId));
    }

    get filterConditions(): FilterCondition[] {
        return this.visibleColumns
            .map(column => column.filter.condition)
            .filter((filter): filter is FilterCondition => filter !== undefined);
    }

    get sortInstructions(): SortInstruction[] | undefined {
        return this.sorting.sortInstructions;
    }
}
