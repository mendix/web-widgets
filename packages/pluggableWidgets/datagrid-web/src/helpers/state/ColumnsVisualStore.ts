import { ColumnId } from "../../typings/GridColumn";
import { action, computed, makeObservable, observable } from "mobx";
import { ColumnSettings } from "../../typings/ColumnSettings";
import { ColumnStore } from "./column/ColumnStore";

export interface IColumnsVisualStore {
    // hide
    toggleHidden(columnId: ColumnId): void;
    isHidden(cId: ColumnId): boolean;

    // order
    swapColumns(columnIdA: ColumnId, columnIdB: ColumnId): void;

    // size
    setSize(columnId: ColumnId, size: number | undefined): void;
    getSize(columnId: ColumnId): number | undefined;
    createSizeSnapshot(): void;
    columnSizes: Record<ColumnId, number | undefined>;
}

export class ColumnsVisualStore implements IColumnsVisualStore {
    columnSize: Map<ColumnId, number | undefined> = new Map();
    columnHidden: Set<ColumnId> = new Set();
    columnsOrder: ColumnId[] = [];

    constructor(private allColumns: ColumnStore[]) {
        this.allColumns.forEach(column => {
            this.columnsOrder.push(column.columnId);
            if (column.initiallyHidden) {
                this.columnHidden.add(column.columnId);
            }
            this.columnSize.set(column.columnId, undefined); // needed for mobx?
        });

        makeObservable(this, {
            columnsOrder: observable,
            columnSize: observable,
            columnHidden: observable,

            columnSettings: computed.struct,
            columnSizes: computed.struct,

            toggleHidden: action,
            setSize: action,
            swapColumns: action,
            showAll: action,
            applyColumnSettings: action,
            createSizeSnapshot: action
        });
    }

    toggleHidden(columnId: ColumnId): void {
        if (!this.columnHidden.delete(columnId)) {
            this.columnHidden.add(columnId);
        }
    }

    isHidden(cId: ColumnId): boolean {
        return this.columnHidden.has(cId);
    }

    swapColumns(columnIdA: ColumnId, columnIdB: ColumnId): void {
        const idxA = this.columnsOrder.indexOf(columnIdA);
        const idxB = this.columnsOrder.indexOf(columnIdB);
        [this.columnsOrder[idxA], this.columnsOrder[idxB]] = [this.columnsOrder[idxB], this.columnsOrder[idxA]];

        this.columnsOrder = [...this.columnsOrder]; // hello mobx?
    }

    setSize(columnId: ColumnId, size: number | undefined): void {
        this.columnSize.set(columnId, size);
    }

    getSize(columnId: ColumnId): number | undefined {
        return this.columnSize.get(columnId);
    }

    createSizeSnapshot(): void {
        this.allColumns.forEach(c => c.takeSizeSnapshot());
    }

    // non-interface methods
    showAll(): void {
        this.columnHidden.clear();
    }

    getColumnOrderWeight(cId: ColumnId): number {
        const index = this.columnsOrder.indexOf(cId);
        if (index === -1) {
            throw new Error(`Unknown column "${cId}"`);
        }

        return index;
    }

    get columnSizes(): Record<ColumnId, number | undefined> {
        const result = {} as Record<ColumnId, number | undefined>;
        this.columnSize.forEach((size, cId) => {
            result[cId] = size;
        });

        return result;
    }

    // settings related

    get columnSettings(): [ColumnSettings[], ColumnId[]] {
        return [
            this.allColumns.map(({ columnId }) => ({
                columnId,
                size: this.columnSize.get(columnId),
                hidden: this.columnHidden.has(columnId),
                filterSettings: undefined,
                orderWeight: this.getColumnOrderWeight(columnId)
            })),
            this.columnsOrder
        ];
    }

    applyColumnSettings(config: ColumnSettings[], columnOrder: ColumnId[]): void {
        config.forEach(conf => {
            const cId = conf.columnId;
            // size
            this.columnSize.set(cId, conf.size);
            // hidden
            if (conf.hidden) {
                this.columnHidden.add(cId);
            }
        });

        this.columnsOrder = [...columnOrder];
    }
}
