import { makeObservable, computed } from "mobx";
import { OptionListFilterInterface, Option } from "../typings/OptionListFilterInterface";

type Params = {
    store: OptionListFilterInterface<string>;
    multiselect: boolean;
    emptyCaption?: string;
};

export class RefFilterController {
    private store: OptionListFilterInterface<string>;
    private isDataFetched = false;
    readonly empty: Option<string>;
    multiselect = false;

    constructor(params: Params) {
        this.store = params.store;
        this.multiselect = params.multiselect;
        this.empty = {
            value: "__EMPTY__",
            caption: params.emptyCaption ?? "",
            selected: false
        };

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

    setup(): void {}

    handleSelect = (value: string): void => {
        if (value === this.empty.value) {
            this.store.replace([]);
        } else if (this.multiselect) {
            this.store.toggle(value);
        } else {
            this.store.replace([value]);
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
