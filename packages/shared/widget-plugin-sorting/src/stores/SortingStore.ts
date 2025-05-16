import { action, computed, makeObservable, observable } from "mobx";
import {
    ListAttributeId,
    Option,
    SortDirection,
    SortingStoreInterface,
    SortInstruction
} from "../SortingStoreInterface";

export class SortingStore implements SortingStoreInterface {
    private _direction: SortDirection;
    private _selected: ListAttributeId | null;
    private _ids: Set<ListAttributeId> = new Set();
    options: Option[];

    constructor(options: Option[], initSort?: SortInstruction) {
        this.options = options;
        this._ids = new Set(options.flatMap(option => (option.value ? [option.value] : [])));
        [this._selected, this._direction] = initSort ?? [null, "asc"];

        makeObservable<this, "_selected" | "_direction">(this, {
            options: observable.ref,
            _selected: observable,
            _direction: observable,
            value: computed,
            sortOrder: computed,
            direction: computed,
            select: action,
            toggleDirection: action
        });
    }

    get value(): ListAttributeId | null {
        return this._selected;
    }

    get direction(): SortDirection {
        return this._direction;
    }

    get sortOrder(): SortInstruction | null {
        return this._selected ? [this._selected, this._direction] : null;
    }

    set sortOrder(sortOrder: SortInstruction | null) {
        if (sortOrder && this._ids.has(sortOrder[0])) {
            [this._selected, this._direction] = sortOrder;
        } else {
            this._selected = null;
        }
    }

    select = (value: ListAttributeId | null): void => {
        this._selected = this._ids.has(value as ListAttributeId) ? value : null;
    };

    toggleDirection = (): void => {
        this._direction = this._direction === "asc" ? "desc" : "asc";
    };
}
