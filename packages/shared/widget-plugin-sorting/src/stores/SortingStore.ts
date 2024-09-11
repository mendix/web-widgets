import { makeObservable, computed, observable, action } from "mobx";
import { ListAttributeId, SortDirection, SortingStoreInterface, SortInstruction, Option } from "../typings";

export class SortingStore implements SortingStoreInterface {
    private _direction: SortDirection;
    private _selected: ListAttributeId | null;
    options: Option[];

    constructor(options: Option[], initSort: SortInstruction[]) {
        this.options = options;
        [[this._selected, this._direction] = [null, "asc"]] = initSort;

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

    get sortOrder(): SortInstruction[] {
        return this._selected ? [[this._selected, this._direction]] : [];
    }

    select = (value: ListAttributeId | null): void => {
        this._selected = value;
    };

    toggleDirection = (): void => {
        this._direction = this._direction === "asc" ? "desc" : "asc";
    };
}
