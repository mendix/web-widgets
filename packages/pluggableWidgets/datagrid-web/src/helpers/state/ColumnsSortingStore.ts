import { ColumnId } from "../../typings/GridColumn";
import { action, makeObservable, observable } from "mobx";
import { SortDirection, SortInstruction, SortRule } from "../../typings/sorting";
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

            toggleSort: action
        });
    }

    getDirection(columnId: ColumnId): [SortDirection, number] | undefined {
        const ruleIndex = this.rules.findIndex(r => r[0] === columnId);
        if (ruleIndex === -1) {
            return undefined;
        }
        const [, dir] = this.rules.at(ruleIndex)!;

        return [dir, ruleIndex + 1];
    }

    toggleSort(columnId: ColumnId): void {
        const [[cId, dir] = []] = this.rules;
        if (!cId || cId !== columnId) {
            // was not sorted or sorted by a different column
            this.rules = [[columnId, "asc"]];
            return;
        }
        if (dir === "asc") {
            // sorted by asc, flip to desc
            this.rules = [[columnId, "desc"]];
            return;
        }
        // sorted by desc, disable
        this.rules = [];
    }
}

export function sortInstructionsToSortRules(
    sortInstructions: SortInstruction[] | undefined,
    allColumns: ColumnStore[]
): SortRule[] {
    if (!sortInstructions || !sortInstructions.length) {
        return [];
    }

    return sortInstructions
        .map((si): SortRule | undefined => {
            const [attrId, dir] = si;
            const cId = allColumns.find(c => c.attrId === attrId)?.columnId;
            if (!cId) {
                return undefined;
            }

            return [cId, dir];
        })
        .filter((r): r is SortRule => !!r);
}

export function sortRulesToSortInstructions(
    sortRules: SortRule[],
    allColumns: ColumnStore[]
): SortInstruction[] | undefined {
    if (!sortRules.length) {
        return undefined;
    }

    return sortRules
        .map((rule): SortInstruction | undefined => {
            const [cId, dir] = rule;
            const attrId = allColumns.find(c => c.columnId === cId)?.attrId;
            if (!attrId) {
                return undefined;
            }
            return [attrId, dir];
        })
        .filter((si): si is SortInstruction => !!si);
}
