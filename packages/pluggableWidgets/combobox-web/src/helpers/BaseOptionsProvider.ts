import { matchSorter, MatchSorterOptions } from "match-sorter";
import { action, computed, makeObservable, observable } from "mobx";
import { FilterTypeEnum } from "typings/ComboboxProps";
import { CaptionsProvider, OptionsProvider, Status } from "./types";
import { getFilterTypeOptions } from "./utils";

export class BaseOptionsProvider<T = unknown, P = object> implements OptionsProvider<T, P> {
    protected options: string[] = [];
    private caption: CaptionsProvider;

    filterType: FilterTypeEnum = "contains";
    searchTerm = "";
    lazyLoading: boolean = false;

    constructor(caption: CaptionsProvider) {
        this.caption = caption;
        makeObservable<this, "options">(this, {
            options: observable.ref,
            filterType: observable,
            searchTerm: observable,
            lazyLoading: observable,
            hasMore: computed,
            isLoading: computed,
            status: computed,
            setSearchTerm: action,
            loadMore: action,
            _updateProps: action
        });
    }

    get hasMore(): boolean {
        return false;
    }

    get isLoading(): boolean {
        return false;
    }

    get status(): Status {
        return "available";
    }

    getAll(): string[] {
        return this.getAllWithMatchSorter();
    }

    protected getAllWithMatchSorter(): string[] {
        const matchSorterOptions: MatchSorterOptions<string> = {
            keys: [v => this.caption.get(v)],
            ...getFilterTypeOptions(this.filterType)
        };

        if (this.searchTerm === "") {
            matchSorterOptions.sorter = option => option;
        }

        return matchSorter(this.options, this.searchTerm || "", matchSorterOptions);
    }

    setSearchTerm(term: string): void {
        this.searchTerm = term;
    }

    loadMore(): void {
        return undefined;
    }

    _updateProps(_props: P): void {
        throw new Error("_updateProps not implemented");
    }
    _optionToValue(_option: string | null): T | undefined {
        throw new Error("_optionToValue not implemented");
    }
    _valueToOption(_value: T | undefined): string | null {
        throw new Error("_valueToOption not implemented");
    }
}
