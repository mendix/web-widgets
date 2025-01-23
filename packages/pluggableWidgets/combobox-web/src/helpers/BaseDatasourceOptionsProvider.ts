import { ListAttributeValue, ListValue, ObjectItem } from "mendix";
import { FilterTypeEnum } from "../../typings/ComboboxProps";
import { BaseOptionsProvider } from "./BaseOptionsProvider";
import { datasourceFilter } from "./datasourceFilter";
import { CaptionsProvider, Status, SortOrder } from "./types";
import { DEFAULT_LIMIT_SIZE } from "./utils";

export interface BaseProps {
    attributeId?: ListAttributeValue["id"];
    ds: ListValue;
    filterType: FilterTypeEnum;
    lazyLoading: boolean;
}

export class BaseDatasourceOptionsProvider extends BaseOptionsProvider<ObjectItem, BaseProps> {
    private ds?: ListValue;
    private attributeId?: ListAttributeValue["id"];
    protected loading: boolean = false;

    constructor(caption: CaptionsProvider, protected valuesMap: Map<string, ObjectItem>) {
        super(caption);
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
            if (this.searchTerm === "") {
                this.ds?.setFilter(undefined);
            } else {
                const filterCondition = datasourceFilter(this.filterType, this.searchTerm, this.attributeId);
                this.ds?.setFilter(filterCondition);
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
    loadSelectedValue(attributeValue: string): void {
        if (this.lazyLoading && this.ds && this.attributeId) {
            const filterCondition = datasourceFilter("containsExact", attributeValue, this.attributeId);
            this.ds?.setFilter(filterCondition);
            this.ds.setLimit(1);
        }
    }

    _updateProps(props: BaseProps): void {
        this.attributeId = props.attributeId;
        this.ds = props.ds;
        this.filterType = props.filterType;
        this.lazyLoading = props.lazyLoading;

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
}
