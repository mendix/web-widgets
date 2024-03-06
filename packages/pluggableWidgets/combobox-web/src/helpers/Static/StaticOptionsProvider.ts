import { OptionsStaticProvider, Status } from "../types";
import { matchSorter } from "match-sorter";
import { FilterTypeEnum, OptionsSourceStaticDataSourceType } from "../../../typings/ComboboxProps";

interface Props {
    ds: OptionsSourceStaticDataSourceType[];
    filterType: FilterTypeEnum;
}

export class StaticOptionsProvider implements OptionsStaticProvider {
    private options: string[] = [];
    private ds: OptionsSourceStaticDataSourceType[] | undefined;
    private trigger?: () => void;
    searchTerm = "";
    filterType: FilterTypeEnum = "contains";
    constructor(private valuesMap: Map<string, OptionsSourceStaticDataSourceType>) {}

    get status(): Status {
        return this.ds ? "available" : "unavailable";
    }

    onAfterSearchTermChange(callback: () => void): void {
        this.trigger = callback;
    }

    getAll(): string[] {
        switch (this.filterType) {
            case "contains":
                return matchSorter(this.options, this.searchTerm || "", {
                    keys: [v => this.valuesMap.get(v)?.staticDataSourceCaption as string],
                    sorter: option => option
                });
            case "startsWith":
                return matchSorter(this.options, this.searchTerm || "", {
                    threshold: matchSorter.rankings.WORD_STARTS_WITH,
                    keys: [v => this.valuesMap.get(v)?.staticDataSourceCaption as string],
                    sorter: option => option
                });
            case "none":
                return matchSorter(this.options, this.searchTerm || "", {
                    threshold: matchSorter.rankings.NO_MATCH,
                    keys: [v => this.valuesMap.get(v)?.staticDataSourceCaption as string],
                    sorter: option => option
                });
        }
    }

    setSearchTerm(term: string): void {
        this.searchTerm = term;
        this.trigger?.();
    }

    _optionToValue(index: string | null): string | undefined {
        if (index === null) {
            return undefined;
        }
        return this.valuesMap.get(index.toString())?.staticDataSourceValue;
    }

    _valueToOption(value: string | undefined): string | null {
        const index = this.options.findIndex(option => this.valuesMap.get(option)?.staticDataSourceValue === value);
        return index.toString() ?? null;
    }

    _updateProps(props: Props): void {
        this.ds = props.ds;
        this.filterType = props.filterType;

        this.valuesMap.clear();

        this.ds.forEach((option, index) => this.valuesMap.set(index.toString(), option));

        this.options = this.ds.map((_, index) => index.toString());
    }
}
