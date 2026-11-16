import { OptionsProvider, Status } from "../helpers/types";

/** A fixed option list for the editor preview; nothing filters or loads. */
export class PreviewOptionsProvider implements OptionsProvider {
    readonly status: Status = "available";
    readonly searchTerm = "";
    readonly hasMore = false;
    readonly isLoading = false;

    constructor(private readonly ids: string[]) {}

    getAll(): string[] {
        return this.ids.length > 0 ? this.ids : ["..."];
    }

    setSearchTerm(): void {}

    loadMore(): void {}
}
