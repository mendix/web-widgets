import { PlainJs, Serializable } from "@mendix/filter-commons/typings/settings";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { action, computed, makeObservable, observable } from "mobx";
import { BasicSortStore, Option, SortInstruction } from "../types/store";

type StorableState = Array<[number, "asc" | "desc"]>;

export class SortOrderStore implements BasicSortStore, Serializable {
    private readonly _sortOrder: SortInstruction[] = [];

    readonly id = `SortOrderStore@${generateUUID()}`;
    readonly options: Option[];
    readonly idToIndex: Map<string, number>;

    constructor(spec: { options?: Option[]; initSortOrder?: SortInstruction[] } = {}) {
        const { options = [], initSortOrder = [] } = spec;

        this.options = [...options];
        this.idToIndex = new Map(options.map((option, index) => [option.value, index]));
        this._sortOrder = [...initSortOrder];

        makeObservable<this, "_sortOrder">(this, {
            _sortOrder: observable,
            sortOrder: computed,
            setSortOrder: action,
            push: action,
            remove: action
        });
    }

    get sortOrder(): SortInstruction[] {
        return [...this._sortOrder];
    }

    setSortOrder(...order: SortInstruction[]): void {
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

    toJSON(): PlainJs {
        const data: StorableState = this.sortOrder.map(inst => {
            const index = this.idToIndex.get(inst[0])!;
            return [index, inst[1]];
        });

        return data;
    }

    fromJSON(data: PlainJs): void {
        if (!Array.isArray(data)) {
            return;
        }
        const sortOrder = (data as StorableState).flatMap<SortInstruction>(([index, direction]) => {
            const value = this.options[index]?.value;
            return value ? [[value, direction]] : [];
        });

        this.setSortOrder(...sortOrder);
    }
}
