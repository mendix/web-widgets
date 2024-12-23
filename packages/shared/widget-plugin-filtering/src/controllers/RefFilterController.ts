import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import { ActionValue } from "mendix";
import { computed, makeObservable } from "mobx";
import { RefFilterStore } from "../stores/RefFilterStore";
import { OptionWithState } from "../typings/BaseSelectStore";
import { Dispose } from "../typings/type-utils";

type Params = {
    store: RefFilterStore;
    multiselect: boolean;
    emptyCaption?: string;
    onChange?: ActionValue;
};

export class RefFilterController {
    private store: RefFilterStore;
    private isDataFetched = false;
    readonly empty: OptionWithState;
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
            inputValue: computed,
            searchValue: computed
        });
    }

    get inputValue(): string {
        const captions = this.store.options.flatMap(opt => (opt.selected ? [opt.caption] : []));
        const size = 0;

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

    get searchValue(): string {
        return "";
    }

    get options(): OptionWithState[] {
        return [...this.store.options];
    }

    setup(): Dispose | void {
        return this.store.setup?.();
    }

    updateProps(props: Pick<Params, "onChange">): void {
        this.onChange = props.onChange;
    }

    handleSelect = (value: string): void => {
        if (value === this.empty.value) {
            this.store.replace([]);
        } else if (this.multiselect) {
            this.store.toggle(value);
        } else {
            this.store.replace([value]);
        }

        executeAction(this.onChange);
    };

    handleSearch = (search: string): void => {
        this.store.setSearch(search);
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

    handleSetValue = (useDefaultValue: boolean, params: { stringValue: string }): void => {
        if (useDefaultValue) {
            this.store.reset();
            return;
        }

        this.store.replace(params.stringValue.split(","));
    };

    handleResetValue = (useDefaultValue: boolean): void => {
        if (useDefaultValue) {
            this.store.reset();
            return;
        }
        this.store.clear();
    };
}
