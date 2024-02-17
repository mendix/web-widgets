import { ColumnId } from "../../typings/GridColumn";
import { action, computed, makeObservable, observable } from "mobx";
import { SortInstruction, SortOrder, SortRule } from "../../typings/GridModel";
import { ensure } from "@mendix/pluggable-widgets-tools";
import { ColumnStore } from "./column/ColumnStore";

export interface IColumnsSortingStore {
    rule: SortRule | undefined;
    toggleSort(columnId: ColumnId): void;
    sortInstructions: SortInstruction[] | undefined;
}

export class ColumnsSortingStore implements IColumnsSortingStore {
    rule: SortRule | undefined = undefined;

    constructor(private allColumns: ColumnStore[]) {
        makeObservable(this, {
            rule: observable,

            config: computed.struct,
            sortInstructions: computed.struct,

            toggleSort: action,
            fromConfig: action
        });
    }

    toggleSort(columnId: ColumnId): void {
        if (!this.rule || this.rule[0] !== columnId) {
            // was not sorted or sorted by a different column
            this.rule = [columnId, "asc"];
            return;
        }
        if (this.rule[1] === "asc") {
            // sorted by asc, flip to desc
            this.rule = [columnId, "desc"];
            return;
        }
        // sorted by desc, disable
        this.rule = undefined;
    }

    get sortInstructions(): SortInstruction[] | undefined {
        if (!this.rule) {
            return undefined;
        }

        const [cId, dir] = this.rule;

        // todo: if attr is not set the column is not sortable
        const attrId = ensure(this.allColumns.find(c => c.columnId === cId)).attrId;
        if (!attrId) {
            return undefined;
        }
        return [[attrId, dir]];
    }

    fromConfig(config: SortOrder) {
        if (config && config.length) {
            const [columnId, dir] = config[0];
            this.rule = [columnId, dir];
            return;
        }

        this.rule = undefined;
    }

    get config(): SortOrder {
        if (!this.rule) {
            return [];
        }

        const [columnId, dir] = this.rule;

        return [[columnId, dir]];
    }
}
