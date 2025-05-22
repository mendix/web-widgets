import { FilterData, InputData } from "@mendix/filter-commons/typings/settings";
import { action, makeObservable, observable } from "mobx";

export class BaseSelectStore {
    protected defaultSelected: Iterable<string> = [];
    protected blockSetDefaults = false;
    selected = new Set<string>();

    constructor() {
        makeObservable(this, {
            selected: observable.struct,
            clear: action,
            reset: action,
            toggle: action,
            setSelected: action,
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

    toJSON(): string[] {
        return [...this.selected];
    }

    fromJSON(json: FilterData): void {
        if (json === undefined || json === null || isInputData(json)) {
            return;
        }
        this.setSelected(json);
        this.blockSetDefaults = true;
    }
}

const fnNames = new Set([
    "empty",
    "notEmpty",
    "equal",
    "notEqual",
    "greater",
    "greaterEqual",
    "smaller",
    "smallerEqual",
    "between",
    "contains",
    "startsWith",
    "endsWith"
]);

export function isInputData(data: unknown): data is InputData {
    if (Array.isArray(data)) {
        const [name] = data;
        return fnNames.has(name);
    }
    return false;
}
