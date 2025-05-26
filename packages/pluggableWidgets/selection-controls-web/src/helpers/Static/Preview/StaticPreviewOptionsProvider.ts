import { OptionsProvider, Status } from "../../types";
import { OptionsSourceStaticDataSourcePreviewType, FilterTypeEnum } from "../../../../typings/ComboboxProps";

export class StaticPreviewOptionsProvider implements OptionsProvider<string, OptionsSourceStaticDataSourcePreviewType> {
    status: Status = "available";
    filterType: FilterTypeEnum = "contains";
    searchTerm: string = "";
    hasMore?: boolean | undefined = undefined;
    isLoading: boolean = false;
    constructor(private optionsMap: Map<string, OptionsSourceStaticDataSourcePreviewType>) {}
    setSearchTerm(_value: string): void {}
    onAfterSearchTermChange(_callback: () => void): void {}
    loadMore?(): void {
        throw new Error("Method not implemented.");
    }
    _updateProps(_: OptionsSourceStaticDataSourcePreviewType): void {
        throw new Error("Method not implemented.");
    }
    _optionToValue(_value: string | null): string | undefined {
        throw new Error("Method not implemented.");
    }
    _valueToOption(_value: string | undefined): string | null {
        throw new Error("Method not implemented.");
    }
    getAll(): string[] {
        return this.optionsMap.size ? Array.from(this.optionsMap.keys()) : ["..."];
    }
}
