import { makeObservable, computed } from "mobx";
import { OptionListFilterInterface, Option } from "../typings/OptionListFilterInterface";

type Params = {
    store: OptionListFilterInterface<string>;
    multiselect: boolean;
    defaultValue?: string;
};

export class StaticFilterController {
    private store: OptionListFilterInterface<string>;
    readonly empty: Option<string>;
    readonly defaults: string[] | undefined;
    multiselect = false;

    constructor(params: Params) {
        this.store = params.store;
        this.multiselect = params.multiselect;
        this.empty = {
            value: "__EMPTY__",
            caption: "",
            selected: false
        };
        this.defaults = params.defaultValue ? [params.defaultValue] : undefined;

        makeObservable(this, {
            inputValue: computed
        });
    }

    get inputValue(): string {
        return this.store.options.flatMap(opt => (opt.selected ? [opt.caption] : [])).join(",");
    }

    get options(): Array<Option<string>> {
        return [...this.store.options];
    }

    setup(): void {
        this.store.UNSAFE_setDefaults(this.defaults);
    }

    onSelect = (value: string): void => {
        if (value === this.empty.value) {
            this.store.replace([]);
        } else if (this.multiselect) {
            this.store.toggle(value);
        } else {
            this.store.replace([value]);
        }
    };
}
