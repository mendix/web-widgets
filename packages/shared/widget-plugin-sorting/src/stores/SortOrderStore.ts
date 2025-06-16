import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { action, computed, makeObservable, observable } from "mobx";
import { BasicSortStore, Option, SortInstruction } from "../types/store";

export class SortOrderStore implements BasicSortStore {
    private readonly _sortOrder: SortInstruction[] = [];

    readonly id = `SortOrderStore@${generateUUID()}`;
    readonly options: Option[];

    constructor(spec: { options?: Option[]; initSortOrder?: SortInstruction[] } = {}) {
        const { options = [], initSortOrder = [] } = spec;

        this.options = [...options];
        this._sortOrder = [...initSortOrder];

        makeObservable<this, "_sortOrder">(this, {
            _sortOrder: observable,
            sortOrder: computed,
            replace: action,
            push: action,
            remove: action
        });
    }

    get sortOrder(): SortInstruction[] {
        return [...this._sortOrder];
    }

    replace(...order: SortInstruction[]): void {
        this._sortOrder.splice(0, this._sortOrder.length, ...order);
    }

    push(...item: SortInstruction[]): void {
        this._sortOrder.push(...item);
    }

    remove(index: number): void {
        if (index >= 0 && index < this._sortOrder.length) {
            this._sortOrder.splice(index, 1);
        }
    }
}
