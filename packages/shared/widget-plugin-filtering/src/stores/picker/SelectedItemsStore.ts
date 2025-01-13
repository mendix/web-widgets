import { makeAutoObservable, observable } from "mobx";

export class SelectedItemsStore {
    selected = new Set<string>();
    private defaultSelected: Iterable<string> = [];

    constructor() {
        makeAutoObservable(this, {
            selected: observable.struct
        });
    }

    setSelected(selected: Iterable<string>): void {
        this.selected = new Set(selected);
    }

    setDefaultSelected(defaultSelected: Iterable<string>): void {
        this.defaultSelected = defaultSelected;
    }

    clear(): void {
        this.setSelected([]);
    }

    reset(): void {
        this.setSelected(this.defaultSelected);
    }

    toggle(value: string): void {
        const next = new Set(this.selected);
        this.setSelected(next.delete(value) ? next : next.add(value));
    }
}
