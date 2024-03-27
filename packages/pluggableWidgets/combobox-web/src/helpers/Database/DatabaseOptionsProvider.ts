import { CaptionsProvider, Status } from "../types";
import { ListValue, ObjectItem } from "mendix";
import { FilterTypeEnum } from "../../../typings/ComboboxProps";
import { BaseOptionsProvider } from "../BaseOptionsProvider";

interface Props {
    ds: ListValue;
    filterType: FilterTypeEnum;
}

export class DatabaseOptionsProvider extends BaseOptionsProvider<ObjectItem, Props> {
    private ds?: ListValue;

    constructor(caption: CaptionsProvider, private valuesMap: Map<string, ObjectItem>) {
        super(caption);
    }

    get status(): Status {
        return this.ds?.status ?? "unavailable";
    }

    get hasMore(): boolean {
        return this.ds?.hasMoreItems ?? false;
    }

    loadMore(): void {
        if (this.ds && this.hasMore) {
            this.ds.setLimit(this.ds.limit + 30);
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
        this.ds = props.ds;
        this.filterType = props.filterType;

        const items = this.ds.items ?? [];

        this.valuesMap.clear();

        items.forEach(i => this.valuesMap.set(i.id, i));

        this.options = Array.from(this.valuesMap.keys());
    }
}
