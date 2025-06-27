import { action, computed, makeObservable, observable, reaction } from "mobx";
import { BasicSortStore, ListAttributeId } from "../types/store";

export class SingleSortController {
    private readonly _sortOrderStore: BasicSortStore;
    private readonly emptyOptionCaption: string;

    direction: "asc" | "desc" = "asc";

    constructor(spec: { store: BasicSortStore; emptyOptionCaption?: string }) {
        const { store, emptyOptionCaption } = spec;
        this.emptyOptionCaption = emptyOptionCaption ?? "Select an attribute";
        this._sortOrderStore = store;

        const [instruction] = store.sortOrder;
        if (instruction) {
            [, this.direction] = instruction;
        }

        makeObservable<this, "_setDirection">(this, {
            options: computed,
            selected: computed,
            direction: observable,
            toggleDirection: action,
            select: action,
            _setDirection: action
        });
    }

    get options(): Array<{ caption: string; value: string }> {
        const empty = { caption: this.emptyOptionCaption, value: "none" };
        return [empty, ...this._sortOrderStore.options];
    }

    get selected(): ListAttributeId | null {
        const [instruction] = this._sortOrderStore.sortOrder;
        return instruction ? instruction[0] : null;
    }

    private _setDirection = (direction: "asc" | "desc" | null): void => {
        if (direction === null) {
            return;
        }
        this.direction = direction;
    };

    toggleDirection = (): void => {
        this.direction = this.direction === "asc" ? "desc" : "asc";
        if (this.selected) {
            this._sortOrderStore.setSortOrder([this.selected, this.direction]);
        }
    };

    select = (value: string): void => {
        if (value === "none") {
            this._sortOrderStore.setSortOrder();
        } else {
            this._sortOrderStore.setSortOrder([value as ListAttributeId, this.direction]);
        }
    };

    setup(): () => void {
        // Sync direction with the store
        return reaction(() => {
            const [instruction] = this._sortOrderStore.sortOrder;
            return instruction ? instruction[1] : null;
        }, this._setDirection);
    }
}
