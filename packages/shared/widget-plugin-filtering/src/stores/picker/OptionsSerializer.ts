import { computed, makeObservable } from "mobx";

interface Params {
    store: Store;
}

interface Store {
    /** @reactive */
    selected: Iterable<string>;
}

export class OptionsSerializer {
    private store: Store;

    constructor(params: Params) {
        makeObservable(this, {
            value: computed
        });

        this.store = params.store;
    }

    get value(): string | undefined {
        const selected = [...this.store.selected];
        return this.toStorableValue(selected);
    }

    fromStorableValue(value: string | undefined): Iterable<string> | undefined {
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
