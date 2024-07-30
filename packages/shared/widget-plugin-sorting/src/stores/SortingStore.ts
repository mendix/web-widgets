import { makeObservable, computed, observable, action } from "mobx";
import { ListAttributeId, SortDirection, SortingStoreInterface, SortInstruction, Option } from "../typings";

export class SortingStore implements SortingStoreInterface {
    private _direction: SortDirection = "asc";
    private _selected: ListAttributeId | null;
    options: Option[];

    constructor(options: Option[], initSort: SortInstruction[]) {
        const [[id = null] = []] = initSort;
        this.options = options;
        this._selected = id;

        makeObservable<this, "_selected" | "_direction">(this, {
            options: observable.ref,
            _selected: observable,
            _direction: observable,
            value: computed,
            sort: computed,
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

    get sort(): SortInstruction[] {
        return this._selected ? [[this._selected, this._direction]] : [];
    }

    select(value: ListAttributeId | null): void {
        this._selected = value;
    }

    toggleDirection(): void {
        this._direction = this._direction === "asc" ? "desc" : "asc";
    }
}
