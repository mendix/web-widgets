import { computed, makeObservable } from "mobx";
import { PickerFilterStore } from "../../typings/PickerFilterStore";

interface Params {
    store: PickerFilterStore;
}

export class OptionsSerializer {
    private store: PickerFilterStore;

    constructor(params: Params) {
        makeObservable(this, {
            value: computed
        });

        this.store = params.store;
    }

    get value(): string | undefined {
        const selected = this.store.options.flatMap(opt => (opt.selected ? [opt.value] : []));
        return this.toStorableValue(selected);
    }

    fromStorableValue(value: string | undefined): string[] | undefined {
        if (!value) {
            return undefined;
        }
        return value.split(",");
    }

    toStorableValue(selected: string[]): string | undefined {
        if (selected.length > 0) {
            return selected.join(",");
        }

        return undefined;
    }
}
