import { CaptionsProvider, OptionsProvider, Status } from "../types";
import { ListValue, ObjectItem, ReferenceSetValue, ReferenceValue } from "mendix";
import { matchSorter } from "match-sorter";
import { FilterTypeEnum } from "../../../typings/ComboboxProps";

interface Props {
    attr: ReferenceValue | ReferenceSetValue;
    ds: ListValue;
    filterType: FilterTypeEnum;
}

export class AssociationOptionsProvider implements OptionsProvider<ObjectItem, Props> {
    private options: string[] = [];
    private ds?: ListValue;
    private trigger?: () => void;
    searchTerm = "";
    filterType: FilterTypeEnum = "contains";

    constructor(private caption: CaptionsProvider, private valuesMap: Map<string, ObjectItem>) {}

    get status(): Status {
        return this.ds?.status ?? "unavailable";
    }

    get hasMore(): boolean {
        return this.ds?.hasMoreItems ?? false;
    }

    onAfterSearchTermChange(callback: () => void): void {
        this.trigger = callback;
    }

    getAll(): string[] {
        switch (this.filterType) {
            case "contains":
                return matchSorter(this.options, this.searchTerm || "", {
                    keys: [v => this.caption.get(v)],
                    sorter: option => option
                });
            case "startsWith":
                return matchSorter(this.options, this.searchTerm || "", {
                    threshold: matchSorter.rankings.WORD_STARTS_WITH,
                    keys: [v => this.caption.get(v)],
                    sorter: option => option
                });
            case "none":
                return matchSorter(this.options, this.searchTerm || "", {
                    threshold: matchSorter.rankings.NO_MATCH,
                    keys: [v => this.caption.get(v)],
                    sorter: option => option
                });
        }
    }

    loadMore(): void {
        if (this.ds && this.hasMore) {
            this.ds.setLimit(this.ds.limit + 30);
        }
    }

    setSearchTerm(term: string): void {
        this.searchTerm = term;
        this.trigger?.();
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

    _updateProps(props: Props): void {
        this.ds = props.ds;
        this.filterType = props.filterType;

        const items = this.ds.items ?? [];

        this.valuesMap.clear();

        items.forEach(i => this.valuesMap.set(i.id, i));

        this.options = Array.from(this.valuesMap.keys());

        if (props.attr.value) {
            const selectedItems = Array.isArray(props.attr.value) ? props.attr.value : [props.attr.value];

            selectedItems.forEach(i => {
                if (!this.valuesMap.has(i.id)) {
                    this.valuesMap.set(i.id, i);
                }
            });
        }
    }
}
