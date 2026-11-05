import { ListAttributeValue, ListValue, ObjectItem } from "mendix";
import { FilterCondition } from "mendix/filters";
import { action, autorun, computed, makeObservable, observable, reaction } from "mobx";
import {
    DerivedPropsGate,
    disposeBatch,
    SetupComponent,
    SetupComponentHost
} from "@mendix/widget-plugin-mobx-kit/main";
import { debounce } from "@mendix/widget-plugin-platform/utils/debounce";
import { BaseOptionsProvider } from "./BaseOptionsProvider";
import { datasourceFilter } from "./datasourceFilter";
import { CaptionsProvider, SortOrder, Status } from "./types";
import { DEFAULT_LIMIT_SIZE } from "./utils";
import { FilterTypeEnum } from "../typings/ComboboxProps";

/** What a datasource-backed selector exposes to its options provider. */
export interface DatasourceSource {
    ds: ListValue;
    /** The caption attribute, when the datasource can filter on it. */
    captionAttributeId?: ListAttributeValue["id"];
    /** Selected items that stay resolvable even when the loaded page does not hold them. */
    selected?: ObjectItem[];
    /** A read-only control loads no options at all. */
    readOnly: boolean;
}

export interface DatasourceOptionsConfig {
    filterType: FilterTypeEnum;
    lazyLoading: boolean;
    filterInputDebounceInterval: number;
}

/**
 * Options from a `ListValue`. Without lazy loading the whole list is loaded and filtered on the
 * client; with it the list is paged, the search term becomes a debounced datasource filter and
 * a page is requested on demand. The datasource limit and filter are kept in step by `setup`.
 */
export class DatasourceOptionsProvider extends BaseOptionsProvider implements SetupComponent {
    private lastPage: ObjectItem[] = [];
    /** The datasource a page was requested on; the request is pending until new props replace it. */
    private loadRequestedOn?: ListValue = undefined;
    private readonly setFilter: (condition: FilterCondition | undefined) => void;
    private readonly abortFilter: () => void;

    constructor(
        host: SetupComponentHost,
        private readonly source: DerivedPropsGate<DatasourceSource>,
        caption: Pick<CaptionsProvider, "get">,
        private readonly config: DatasourceOptionsConfig
    ) {
        super(caption, config.filterType);
        [this.setFilter, this.abortFilter] = debounce(
            (condition: FilterCondition | undefined) => this.ds.setFilter(condition),
            config.filterInputDebounceInterval
        );
        makeObservable<this, "page" | "byId" | "loadRequestedOn" | "wantedLimit">(this, {
            page: computed,
            byId: computed,
            ids: computed,
            loadRequestedOn: observable.ref,
            status: computed,
            hasMore: computed,
            isLoading: computed,
            sortOrder: computed,
            datasourceFilter: computed,
            wantedLimit: computed,
            loadMore: action,
            loadSelectedValue: action
        });
        host.add(this);
    }

    /** A plain getter on purpose: a Mendix value behind a computed would hide an in-place change. */
    private get ds(): ListValue {
        return this.source.props.ds;
    }

    /** The loaded page. A datasource mid-reload reports no items; the previous page stays until the new one arrives. */
    private get page(): ObjectItem[] {
        const { ds } = this;
        if (ds.items) {
            this.lastPage = ds.items;
        } else if (ds.status !== "loading") {
            this.lastPage = [];
        }
        return this.lastPage;
    }

    private get byId(): Map<string, ObjectItem> {
        const map = new Map(this.page.map(item => [item.id, item]));
        for (const item of this.source.props.selected ?? []) {
            if (!map.has(item.id)) {
                map.set(item.id, item);
            }
        }
        return map;
    }

    get ids(): string[] {
        return this.page.map(item => item.id);
    }

    /** The object behind an option id, or a selected one outside the page. */
    item(id: string | null): ObjectItem | undefined {
        return id === null ? undefined : this.byId.get(id);
    }

    get status(): Status {
        return this.ds.status;
    }

    get hasMore(): boolean {
        return this.ds.hasMoreItems ?? false;
    }

    get isLoading(): boolean {
        return this.config.lazyLoading && (this.ds.status === "loading" || this.loadRequestedOn === this.ds);
    }

    /** Undefined when the datasource has no sort order. */
    get sortOrder(): SortOrder | undefined {
        return this.ds.sortOrder[0]?.[1];
    }

    get datasourceFilter(): ListValue["filter"] {
        return this.ds.filter;
    }

    /** Lazy loading: the datasource filters, so the page is listed as it is. */
    getAll(): string[] {
        return this.config.lazyLoading ? this.ids : this.filtered;
    }

    loadMore(): void {
        const { ds } = this;
        if (ds.hasMoreItems) {
            ds.setLimit(ds.limit + DEFAULT_LIMIT_SIZE);
            if (this.config.lazyLoading) {
                this.loadRequestedOn = ds;
            }
        }
    }

    /** Lazy loading: fetches a bound value that is not in the loaded page by itself, so its caption can show. */
    loadSelectedValue(value: string, attributeId?: ListAttributeValue["id"]): void {
        const id = attributeId ?? this.source.props.captionAttributeId;
        if (this.config.lazyLoading && id) {
            this.setFilter(datasourceFilter("containsExact", value, id));
            this.ds.setLimit(1);
        }
    }

    /**
     * The datasource limit the widget wants: nothing while unavailable or read-only, the current
     * page while lazy loading (its first page is requested by the Core on open), no limit otherwise.
     */
    private get wantedLimit(): number | undefined {
        const { ds } = this;
        const { lazyLoading } = this.config;
        if (ds.status !== "available" || this.source.props.readOnly) {
            if (ds.status === "loading" && lazyLoading) {
                return ds.limit === Infinity || !ds.limit ? 0 : ds.limit;
            }
            return 0;
        }
        return lazyLoading ? ds.limit : undefined;
    }

    setup(): () => void {
        const [add, disposeAll] = disposeBatch();
        add(
            autorun(() => {
                const limit = this.wantedLimit;
                if (limit !== this.ds.limit) {
                    this.ds.setLimit(limit);
                }
            })
        );
        add(
            reaction(
                () => this.searchTerm,
                term => {
                    const { captionAttributeId } = this.source.props;
                    if (this.config.lazyLoading && captionAttributeId) {
                        this.setFilter(
                            term === "" ? undefined : datasourceFilter(this.config.filterType, term, captionAttributeId)
                        );
                    }
                }
            )
        );
        add(this.abortFilter);
        return disposeAll;
    }
}
