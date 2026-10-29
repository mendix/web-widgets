import { matchSorter } from "match-sorter";
import { makeObservable, observable, override } from "mobx";
import { StaticCaptionsProvider } from "./StaticCaptionsProvider";
import { FilterTypeEnum, OptionsSourceStaticDataSourceType } from "../../../typings/ComboboxProps";
import { BaseOptionsProvider } from "../BaseOptionsProvider";
import { Status } from "../types";

interface Props {
    ds: OptionsSourceStaticDataSourceType[];
    filterType: FilterTypeEnum;
}

export class StaticOptionsProvider extends BaseOptionsProvider<string | Big | boolean | Date, Props> {
    ds: OptionsSourceStaticDataSourceType[] | undefined;

    constructor(
        caption: StaticCaptionsProvider,
        private valuesMap: Map<string, OptionsSourceStaticDataSourceType>
    ) {
        super(caption);
        makeObservable(this, { ds: observable.ref, status: override, _updateProps: override });
    }

    get status(): Status {
        return this.ds ? "available" : "unavailable";
    }

    getAll(): string[] {
        switch (this.filterType) {
            case "contains":
                return matchSorter(this.options, this.searchTerm || "", {
                    keys: [v => this.valuesMap.get(v)?.staticDataSourceCaption.value as string],
                    sorter: option => option
                });
            case "containsExact":
                return matchSorter(this.options, this.searchTerm || "", {
                    threshold: matchSorter.rankings.CONTAINS,
                    keys: [v => this.valuesMap.get(v)?.staticDataSourceCaption.value as string],
                    sorter: option => option
                });
            case "startsWith":
                return matchSorter(this.options, this.searchTerm || "", {
                    threshold: matchSorter.rankings.WORD_STARTS_WITH,
                    keys: [v => this.valuesMap.get(v)?.staticDataSourceCaption.value as string],
                    sorter: option => option
                });
            case "none":
                return matchSorter(this.options, this.searchTerm || "", {
                    threshold: matchSorter.rankings.NO_MATCH,
                    keys: [v => this.valuesMap.get(v)?.staticDataSourceCaption.value as string],
                    sorter: option => option
                });
        }
    }

    _optionToValue(index: string | boolean | null): string | Big | boolean | Date | undefined {
        if (index === null) {
            return undefined;
        }
        return this.valuesMap.get(index.toString())?.staticDataSourceValue.value;
    }

    _valueToOption(value: string | Big | boolean | Date | undefined): string | null {
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
