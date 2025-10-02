import { CaptionsProvider, OptionsProvider, Status } from "./types";

export class BaseOptionsProvider<T = unknown, P = object> implements OptionsProvider<T, P> {
    protected options: string[] = [];
    private trigger?: () => void;

    searchTerm = "";

    constructor(protected caption: CaptionsProvider) {}

    get hasMore(): boolean {
        return false;
    }

    get isLoading(): boolean {
        return false;
    }

    get status(): Status {
        return "available";
    }

    get sortOrder(): undefined {
        return undefined;
    }

    get datasourceFilter(): undefined {
        return undefined;
    }

    getAll(): string[] {
        return this.options;
    }

    setSearchTerm(term: string): void {
        this.searchTerm = term;
        this.trigger?.();
    }

    onAfterSearchTermChange(callback: () => void): void {
        this.trigger = callback;
    }

    loadMore(): void {
        return undefined;
    }

    _updateProps(_props: P): void {
        throw new Error("_updateProps not implemented");
    }
    _optionToValue(_option: string | null): T | undefined {
        throw new Error("_optionToValue not implemented");
    }
    _valueToOption(_value: T | undefined): string | null {
        throw new Error("_valueToOption not implemented");
    }
}
