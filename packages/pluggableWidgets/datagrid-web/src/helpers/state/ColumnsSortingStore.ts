import { ColumnId } from "../../typings/GridColumn";
import { action, computed, makeObservable, observable } from "mobx";
import { SortDirection, SortInstruction, SortRule } from "../../typings/GridModel";
import { ColumnStore } from "./column/ColumnStore";

export interface IColumnSortingStore {
    getDirection(columnId: ColumnId): [SortDirection, number] | undefined;
    toggleSort(columnId: ColumnId): void;
}

export class ColumnsSortingStore implements IColumnSortingStore {
    rules: SortRule[] = [];

    constructor(initialRules: SortRule[]) {
        this.rules = initialRules;

        makeObservable(this, {
            rules: observable.struct,

            config: computed.struct,

            toggleSort: action,
            fromConfig: action
        });
    }

    getDirection(columnId: ColumnId): [SortDirection, number] | undefined {
        const ruleIndex = this.rules.findIndex(r => r[0] === columnId);
        if (ruleIndex === -1) {
            return undefined;
        }
        const rule = this.rules.at(ruleIndex)!;

        return [rule[1], ruleIndex + 1];
    }

    toggleSort(columnId: ColumnId): void {
        const rule = this.rules[0];
        if (!rule || rule[0] !== columnId) {
            // was not sorted or sorted by a different column
            this.rules = [[columnId, "asc"]];
            return;
        }
        if (rule[1] === "asc") {
            // sorted by asc, flip to desc
            this.rules = [[columnId, "desc"]];
            return;
        }
        // sorted by desc, disable
        this.rules = [];
    }

    fromConfig(config: SortRule[]): void {
        this.rules = config;
    }

    get config(): SortRule[] {
        return this.rules;
    }
}

export function sortInstructionsToSortRules(
    sortInstructions: SortInstruction[] | undefined,
    allColumns: ColumnStore[]
): SortRule[] {
    if (!sortInstructions || !sortInstructions.length) {
        return [];
    }

    return sortInstructions.map(si => {
        const [attrId, dir] = si;
        const cId = allColumns.find(c => c.attrId === attrId)?.columnId;
        if (!cId) {
            throw new Error(`Unknown attribute id: '${attrId}'`);
        }

        return [cId, dir];
    });
}

export function sortRulesToSortInstructions(
    sortRules: SortRule[],
    allColumns: ColumnStore[]
): SortInstruction[] | undefined {
    if (!sortRules.length) {
        return undefined;
    }

    const sortInstructions: SortInstruction[] = [];

    sortRules.forEach(rule => {
        const [cId, dir] = rule;
        const attrId = allColumns.find(c => c.columnId === cId)?.attrId;
        if (!attrId) {
            console.warn(`Can't apply sorting for column ${cId}. The column either doesn't exist or not sortable.`);
            return undefined;
        }
        sortInstructions.push([attrId, dir]);
    });

    return sortInstructions;
}
