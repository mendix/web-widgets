import { debounce } from "@mendix/widget-plugin-platform/utils/debounce";
import { ListAttributeValue, ListValue, ObjectItem } from "mendix";
import { FilterTypeEnum } from "../../typings/ComboboxProps";
import { BaseOptionsProvider } from "./BaseOptionsProvider";
import { datasourceFilter } from "./datasourceFilter";
import { CaptionsProvider, SortOrder, Status } from "./types";
import { DEFAULT_LIMIT_SIZE } from "./utils";

export interface BaseProps {
    attributeId?: ListAttributeValue["id"];
    ds: ListValue;
    filterType: FilterTypeEnum;
    lazyLoading: boolean;
    datasourceFilterDebounceInterval?: number;
}

export class BaseDatasourceOptionsProvider extends BaseOptionsProvider<ObjectItem, BaseProps> {
    private ds?: ListValue;
    private attributeId?: ListAttributeValue["id"];
    protected loading: boolean = false;
    private debouncedSetFilter?: (filterCondition: any) => void;
    private abortDebouncedFilter?: () => void;
    private datasourceFilterDebounceInterval: number = 200;

    constructor(
        caption: CaptionsProvider,
        protected valuesMap: Map<string, ObjectItem>
    ) {
        super(caption);
    }

    private createDebouncedSetFilter(): void {
        if (this.abortDebouncedFilter) {
            this.abortDebouncedFilter();
        }

        const [debouncedFn, abort] = debounce((filterCondition: any) => {
            this.ds?.setFilter(filterCondition);
        }, this.datasourceFilterDebounceInterval);

        this.debouncedSetFilter = debouncedFn;
        this.abortDebouncedFilter = abort;
    }

    get sortOrder(): SortOrder {
        let sortDir: SortOrder = "asc";
        if (this.ds) {
            sortDir = (this.ds.sortOrder[0] ?? [])[1];
        }
        return sortDir;
    }

    get status(): Status {
        return this.ds?.status ?? "unavailable";
    }

    get hasMore(): boolean {
        return this.ds?.hasMoreItems ?? false;
    }

    get isLoading(): boolean {
        return this.loading;
    }

    get datasourceFilter(): ListValue["filter"] | undefined {
        return this.ds?.filter;
    }

    getAll(): string[] {
        if (this.lazyLoading && this.attributeId) {
            if (!this.debouncedSetFilter) {
                this.createDebouncedSetFilter();
            }
            if (this.searchTerm === "") {
                this.debouncedSetFilter!(undefined);
            } else {
                const filterCondition = datasourceFilter(this.filterType, this.searchTerm, this.attributeId);
                this.debouncedSetFilter!(filterCondition);
            }

            return this.options;
        } else {
            return this.getAllWithMatchSorter();
        }
    }

    loadMore(): void {
        if (this.ds && this.hasMore) {
            this.ds.setLimit(this.ds.limit + DEFAULT_LIMIT_SIZE);

            if (this.lazyLoading) {
                this.loading = true;
            }
        }
    }

    _optionToValue(value: string | null): ObjectItem | undefined {
        if (value === null) {
            return undefined;
        }

        return this.valuesMap.get(value);
    }

    _valueToOption(value: ObjectItem | undefined): string | null {
        return (value?.id as string) ?? null;
    }

    // used for initial load of selected value in case options are lazy loaded
    loadSelectedValue(attributeValue: string, attrId?: ListAttributeValue["id"]): void {
        if (this.lazyLoading && this.ds && this.attributeId) {
            if (!this.debouncedSetFilter) {
                this.createDebouncedSetFilter();
            }

            const filterCondition = datasourceFilter("containsExact", attributeValue, attrId ?? this.attributeId);
            this.debouncedSetFilter!(filterCondition);
            this.ds.setLimit(1);
        }
    }

    _updateProps(props: BaseProps): void {
        this.attributeId = props.attributeId;
        this.ds = props.ds;
        this.filterType = props.filterType;
        this.lazyLoading = props.lazyLoading;

        const newInterval = props.datasourceFilterDebounceInterval ?? 200;
        if (newInterval !== this.datasourceFilterDebounceInterval) {
            this.datasourceFilterDebounceInterval = newInterval;
            this.createDebouncedSetFilter();
        }

        if (this.lazyLoading) {
            if (props.ds.status === "loading") {
                this.loading = true;
            } else {
                this.loading = false;
            }
        }

        const items = this.ds.items ?? [];
        this.valuesMap.clear();
        items.forEach(i => this.valuesMap.set(i.id, i));
        this.options = Array.from(this.valuesMap.keys());
    }

    cleanup(): void {
        if (this.abortDebouncedFilter) {
            this.abortDebouncedFilter();
        }
    }
}
