import { CaptionsProvider, OptionsProvider, Status } from "../types";
import { ListValue, ObjectItem, ReferenceSetValue, ReferenceValue } from "mendix";
import { matchSorter } from "match-sorter";

interface Props {
    attr: ReferenceValue | ReferenceSetValue;
    ds: ListValue;
}

export class AssociationOptionsProvider implements OptionsProvider<ObjectItem, Props> {
    private searchTerm = "";
    private options: string[] = [];
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
        // TODO: changes here
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
