import { disposeBatch } from "@mendix/widget-plugin-mobx-kit/disposeBatch";
import { ISetupable } from "@mendix/widget-plugin-mobx-kit/setupable";
import { FilterCondition } from "mendix/filters";
import { FilterAPI } from "../context";
import { StringInputFilterStore } from "../stores/input/StringInputFilterStore";
import { String_InputFilterInterface } from "../typings/InputFilterInterface";
import { FilterSpec } from "./typings";

export class StringStoreProvider implements ISetupable {
    private _store: StringInputFilterStore;
    readonly dataKey: string;

    constructor(private filterAPI: FilterAPI, spec: FilterSpec<string>) {
        this.dataKey = spec.dataKey;
        this._store = new StringInputFilterStore(
            spec.attributes,
            this.findInitFilter(filterAPI.sharedInitFilter, this.dataKey)
        );
    }

    private findInitFilter(_: Array<FilterCondition | undefined>, __: string): FilterCondition | null {
        return null;
    }

    get store(): String_InputFilterInterface {
        return this._store;
    }

    setup(): () => void {
        const [add, disposeAll] = disposeBatch();
        this.filterAPI.filterObserver.observe(this.dataKey, this._store);
        add(() => this.filterAPI.filterObserver.unobserve(this.dataKey));
        add(this.store.setup?.());

        return disposeAll;
    }
}
