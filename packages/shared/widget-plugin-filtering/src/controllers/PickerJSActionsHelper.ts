import { IJSActionsControlled } from "../typings/IJSActionsControlled";

interface FilterStore {
    reset: () => void;
    clear: () => void;
    setSelected: (value: Iterable<string>) => void;
}

type Parse = (value: string) => Iterable<string>;

export class PickerJSActionsHelper implements IJSActionsControlled {
    private filterStore: FilterStore;
    private parse: Parse;
    private multiselect: boolean;

    constructor({ filterStore, parse, multiselect }: { filterStore: FilterStore; parse: Parse; multiselect: boolean }) {
        this.filterStore = filterStore;
        this.parse = parse;
        this.multiselect = multiselect;
    }

    handleResetValue = (useDefaultValue: boolean): void => {
        if (useDefaultValue) {
            this.filterStore.reset();
            return;
        }
        this.filterStore.clear();
    };

    handleSetValue = (useDefaultValue: boolean, params: { stringValue: string }): void => {
        if (useDefaultValue) {
            this.filterStore.reset();
            return;
        }
        let value = Array.from(this.parse(params.stringValue));
        if (!this.multiselect) {
            value = value.slice(0, 1);
        }
        this.filterStore.setSelected(value);
    };
}
