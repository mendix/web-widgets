import { ObjectItem } from "mendix";
import { BaseOptionsProvider } from "../BaseOptionsProvider";
import { CaptionsProvider, OptionsProvider, Status } from "../types";

export class PreviewOptionsProvider implements OptionsProvider<ObjectItem, BaseOptionsProvider> {
    hasMore?: boolean | undefined = undefined;
    searchTerm: string = "";
    status: Status = "available";
    isLoading: boolean = false;

    constructor(
        protected caption: CaptionsProvider,
        protected valuesMap: Map<string, ObjectItem>
    ) {}
    onAfterSearchTermChange(_callback: () => void): void {}
    setSearchTerm(_value: string): void {}
    loadMore?(): void {
        throw new Error("Method not implemented.");
    }
    _updateProps(_: BaseOptionsProvider): void {
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
