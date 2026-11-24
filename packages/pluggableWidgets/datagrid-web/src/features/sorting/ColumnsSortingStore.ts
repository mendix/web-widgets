import { action, makeObservable, observable } from "mobx";
import { SortDirection, SortInstruction, SortRule } from "./sorting";
import { ColumnStore } from "../columns/ColumnStore";
import { ColumnId } from "../columns/GridColumn";

export class ColumnsSortingStore {
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
        const rule = this.rules[ruleIndex];
        return rule ? [rule[1], ruleIndex + 1] : undefined;
    }

    toggleSort(columnId: ColumnId): void {
        const [[cId, dir] = []] = this.rules;
        if (!cId || cId !== columnId) {
            this.rules = [[columnId, "asc"]];
            return;
        }
        if (dir === "asc") {
            this.rules = [[columnId, "desc"]];
            return;
        }
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
