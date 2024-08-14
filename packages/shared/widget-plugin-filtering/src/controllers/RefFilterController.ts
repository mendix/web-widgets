import { ActionValue } from "mendix";
import { makeObservable, computed } from "mobx";
import { OptionListFilterInterface, Option } from "../typings/OptionListFilterInterface";

type Params = {
    store: OptionListFilterInterface<string>;
    multiselect: boolean;
    emptyCaption?: string;
    onChange?: ActionValue;
};

export class RefFilterController {
    private store: OptionListFilterInterface<string>;
    private isDataFetched = false;
    readonly empty: Option<string>;
    multiselect = false;
    private onChange?: ActionValue;

    constructor(params: Params) {
        this.store = params.store;
        this.multiselect = params.multiselect;
        this.empty = {
            value: "__EMPTY__",
            caption: params.emptyCaption ?? "",
            selected: false
        };
        this.onChange = params.onChange;

        makeObservable(this, {
            inputValue: computed
        });
    }

    get inputValue(): string {
        const captions = this.store.options.flatMap(opt => (opt.selected ? [opt.caption] : []));
        const size = this.store.selectedCount ?? 0;

        if (size === 0) {
            return "";
        }
        // We have GUIDs but no captions.
        if (captions.length === 0) {
            return size === 1 ? `1 item selected` : `${size} items selected`;
        }
        // We have less captions then needed.
        if (captions.length < size) {
            return `${captions.join(",")} (+${size - captions.length})`;
        }

        // We have all captions.
        return captions.join(",");
    }

    get options(): Array<Option<string>> {
        return [...this.store.options];
    }

    setup(): void {}

    handleSelect = (value: string): void => {
        if (value === this.empty.value) {
            this.store.replace([]);
        } else if (this.multiselect) {
            this.store.toggle(value);
        } else {
            this.store.replace([value]);
        }

        if (this.onChange?.canExecute) {
            this.onChange.execute();
        }
    };

    handleTriggerClick = (): void => {
        if (this.isDataFetched === false && this.store.hasMore) {
            this.store.loadMore();
            this.isDataFetched = true;
        }
    };

    handleScrollEnd = (): void => {
        if (this.store.hasMore) {
            this.store.loadMore();
        }
    };
}
