import { action, computed, makeObservable } from "mobx";
import { FilterData } from "../../typings/settings";
import { isInputData } from "../input/store-utils";
import { SelectedItemsStore } from "./SelectedItemsStore";

export class BaseSelectStore {
    protected selectState: SelectedItemsStore;
    protected blockSetDefaults = false;

    constructor() {
        this.selectState = new SelectedItemsStore();
        makeObservable(this, {
            clear: action,
            reset: action,
            toggle: action,
            setSelected: action,
            setDefaultSelected: action,
            toJSON: computed,
            fromJSON: action
        });
    }

    get selected(): Set<string> {
        return this.selectState.selected;
    }

    clear = (): void => this.selectState.clear();

    reset = (): void => this.selectState.reset();

    toggle = (value: string): void => this.selectState.toggle(value);

    setSelected = (value: Iterable<string>): void => {
        this.selectState.setSelected(value);
    };

    setDefaultSelected(defaultSelected?: Iterable<string>): void {
        if (!this.blockSetDefaults && defaultSelected) {
            this.selectState.setDefaultSelected(defaultSelected);
            this.selectState.reset();
            this.blockSetDefaults = true;
        }
    }

    toJSON(): string[] {
        return [...this.selectState.selected];
    }

    fromJSON(json: FilterData): void {
        if (json === null || isInputData(json)) {
            return;
        }
        this.setSelected(json);
        this.blockSetDefaults = true;
    }
}
