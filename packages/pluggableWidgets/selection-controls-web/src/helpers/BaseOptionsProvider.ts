import { OptionsProvider, Status } from "./types";

export class BaseOptionsProvider<T = unknown, P = object> implements OptionsProvider<T, P> {
    protected options: string[] = [];
    // private caption: CaptionsProvider;
    // searchTerm = "";

    // constructor(caption: CaptionsProvider) {
    //     this.caption = caption;
    // }

    get hasMore(): boolean {
        return false;
    }

    get isLoading(): boolean {
        return false;
    }

    get status(): Status {
        return "available";
    }

    getAll(): string[] {
        return this.options;
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
