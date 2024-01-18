import { matchSorter } from "match-sorter";
import { EditableValue } from "mendix";
import { FilterTypeEnum } from "../../../typings/ComboboxProps";
import { CaptionsProvider, OptionsProvider, Status } from "../types";

export class EnumBoolOptionsProvider<T extends boolean | string>
    implements OptionsProvider<T, { attribute: EditableValue<string | boolean> }>
{
    status: Status = "available";
    private isBoolean = false;
    private options: string[] = [];
    private trigger?: () => void;

    searchTerm = "";
    filterType: FilterTypeEnum = "contains";
    hasMore = false;

    constructor(private caption: CaptionsProvider) {}

    loadMore(): void {
        return undefined;
    }
    onAfterSearchTermChange(callback: () => void): void {
        this.trigger = callback;
    }

    _updateProps(props: { attribute: EditableValue<string | boolean>; filterType: FilterTypeEnum }): void {
        if (props.attribute.status === "unavailable") {
            this.options = [];
        }
        this.filterType = props.filterType;
        this.options = (props.attribute.universe ?? []).map(o => o.toString());
        this.isBoolean = typeof props.attribute.universe?.[0] === "boolean";
    }

    _optionToValue(value: string | null): T | undefined {
        if (this.isBoolean) {
            return (value === "true") as T;
        } else {
            return (value ?? undefined) as T;
        }
    }

    _valueToOption(value: string | boolean | undefined): string | null {
        return value?.toString() ?? null;
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

    setSearchTerm(term: string): void {
        this.searchTerm = term;
        this.trigger?.();
    }
}
