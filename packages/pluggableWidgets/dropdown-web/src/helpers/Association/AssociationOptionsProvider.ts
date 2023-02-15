import { CaptionsProvider, OptionsProvider, Status } from "../types";
import { ListAttributeValue, ListValue, ObjectItem, ReferenceSetValue, ReferenceValue } from "mendix";
import { matchSorter } from "match-sorter";
import { attribute, contains, literal, or } from "mendix/filters/builders";

interface Props {
    attr: ReferenceValue | ReferenceSetValue;
    ds: ListValue;
    searchableAttributes: ListAttributeValue[];
}

export class AssociationOptionsProvider implements OptionsProvider<ObjectItem, Props> {
    private searchTerm: string = "";
    private options: string[] = [];
    private attributes: ListAttributeValue[] = [];
    private ds?: ListValue;

    constructor(private caption: CaptionsProvider, private valuesMap: Map<string, ObjectItem>) {}

    get status(): Status {
        return this.ds?.status ?? "unavailable";
    }

    get hasMore(): boolean {
        return this.ds?.hasMoreItems ?? false;
    }

    getAll(): string[] {
        return matchSorter(this.options, this.searchTerm || "", { keys: [v => this.caption.get(v)] });
    }

    loadMore(): void {
        if (this.ds && this.hasMore) {
            this.ds.setLimit(this.ds.limit + 30);
        }
    }

    setSearchTerm(term: string): void {
        this.searchTerm = term;

        if (this.ds && this.attributes.length > 0) {
            console.log("applyting ", this.searchTerm);
            if (this.searchTerm !== "") {
                const a = this.attributes.map(a => contains(attribute(a.id), literal(this.searchTerm)));
                this.ds?.setFilter(a.length === 1 ? a[0] : or(...a));
            } else {
                this.ds?.setFilter(undefined);
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

    _updateProps(props: Props): void {
        this.attributes = props.searchableAttributes;
        // current value
        // const currentValue = (props.attr.value?.id as string) ?? null;

        // prepare options
        // const items = props.ds.items ?? [];
        this.ds = props.ds;

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
