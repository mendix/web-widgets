import { action, makeObservable, observable } from "mobx";
import { ColumnId, SortDirection, SortRule } from "./GridColumn";

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
