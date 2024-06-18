import { ObjectItem } from "mendix";
import { BaseProps } from "../../../helpers/BaseDatasourceOptionsProvider";
import { CaptionsProvider, OptionsProvider, Status } from "../../types";
import { FilterTypeEnum } from "../../../../typings/ComboboxProps";

export class AssociationPreviewOptionsProvider implements OptionsProvider<ObjectItem, BaseProps> {
    filterType: FilterTypeEnum = "contains";
    hasMore?: boolean | undefined = undefined;
    searchTerm: string = "";
    status: Status = "available";
    isLoading: boolean = false;

    constructor(protected caption: CaptionsProvider, protected valuesMap: Map<string, ObjectItem>) {}
    onAfterSearchTermChange(_callback: () => void): void {}
    setSearchTerm(_value: string): void {}
    loadMore?(): void {
        throw new Error("Method not implemented.");
    }
    _updateProps(_: BaseProps): void {
        throw new Error("Method not implemented.");
    }
    _optionToValue(_value: string | null): ObjectItem | undefined {
        throw new Error("Method not implemented.");
    }
    _valueToOption(_value: ObjectItem | undefined): string | null {
        throw new Error("Method not implemented.");
    }
    getAll(): string[] {
        return ["..."];
    }
}
