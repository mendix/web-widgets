import { ListAttributeValue, ListValue, ObjectItem } from "mendix";
import { BaseOptionsProvider } from "./BaseOptionsProvider";
import { SortOrder, Status } from "./types";
import { DEFAULT_LIMIT_SIZE } from "./utils";

export interface BaseProps {
    attributeId?: ListAttributeValue["id"];
    ds: ListValue;
}

export class BaseDatasourceOptionsProvider extends BaseOptionsProvider<ObjectItem, BaseProps> {
    private ds?: ListValue;
    // private attributeId?: ListAttributeValue["id"];

    constructor(
        // caption: CaptionsProvider,
        protected valuesMap: Map<string, ObjectItem>
    ) {
        super();
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

    get datasourceFilter(): ListValue["filter"] | undefined {
        return this.ds?.filter;
    }

    getAll(): string[] {
        return this.options;
    }

    loadMore(): void {
        if (this.ds && this.hasMore) {
            this.ds.setLimit(this.ds.limit + DEFAULT_LIMIT_SIZE);
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

    _updateProps(props: BaseProps): void {
        // this.attributeId = props.attributeId;
        this.ds = props.ds;

        const items = this.ds.items ?? [];
        this.valuesMap.clear();
        items.forEach(i => this.valuesMap.set(i.id, i));
        this.options = Array.from(this.valuesMap.keys());
    }
}
