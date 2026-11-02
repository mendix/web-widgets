import { matchSorter, MatchSorterOptions } from "match-sorter";
import { action, computed, makeObservable, observable } from "mobx";
import { CaptionsProvider, OptionsProvider, Status } from "./types";
import { getFilterTypeOptions } from "./utils";
import { FilterTypeEnum } from "../../typings/ComboboxProps";

/**
 * Options narrowed on the client by the search term, matched against the captions. Subclasses
 * derive `ids` from their source; the search term is the only state here.
 */
export abstract class BaseOptionsProvider implements OptionsProvider {
    searchTerm = "";
    /** Keep the source order for every term instead of ranking the matches. */
    protected readonly keepSourceOrder: boolean = false;

    constructor(
        private readonly caption: Pick<CaptionsProvider, "get">,
        protected readonly filterType: FilterTypeEnum
    ) {
        makeObservable<this, "filtered">(this, {
            searchTerm: observable,
            filtered: computed,
            setSearchTerm: action
        });
    }

    /** Every option id in source order. */
    abstract get ids(): string[];

    get status(): Status {
        return "available";
    }

    get hasMore(): boolean {
        return false;
    }

    get isLoading(): boolean {
        return false;
    }

    getAll(): string[] {
        return this.filtered;
    }

    protected get filtered(): string[] {
        const options: MatchSorterOptions<string> = {
            keys: [id => this.caption.get(id)],
            ...getFilterTypeOptions(this.filterType)
        };
        if (this.searchTerm === "" || this.keepSourceOrder) {
            options.sorter = matches => matches;
        }
        return matchSorter(this.ids, this.searchTerm, options);
    }

    setSearchTerm(term: string): void {
        this.searchTerm = term;
    }

    loadMore(): void {
        // nothing to load: every option is here
    }
}
