import { action, makeObservable, observable } from "mobx";
import { FilterData } from "../../typings/settings";
import { isInputData } from "../input/store-utils";

export class BaseSelectStore {
    private defaultSelected: Iterable<string> = [];
    protected blockSetDefaults = false;
    selected = new Set<string>();

    constructor() {
        makeObservable(this, {
            selected: observable.struct,
            clear: action,
            reset: action,
            toggle: action,
            setSelected: action,
            setDefaultSelected: action,
            fromJSON: action
        });
    }

    setSelected(selected: Iterable<string>): void {
        this.selected = new Set(selected);
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

    setDefaultSelected(defaultSelected?: Iterable<string>): void {
        if (!this.blockSetDefaults && defaultSelected) {
            this.defaultSelected = defaultSelected;
            this.setSelected(defaultSelected);
            this.blockSetDefaults = true;
        }
    }

    toJSON(): string[] {
        return [...this.selected];
    }

    fromJSON(json: FilterData): void {
        if (json === null || isInputData(json)) {
            return;
        }
        this.setSelected(json);
        this.blockSetDefaults = true;
    }
}
