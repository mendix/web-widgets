import { ListValue } from "mendix";

type Members = "setOffset" | "setSortOrder" | "setFilter" | "requestTotalCount" | "totalCount" | "limit" | "offset";

export interface QueryController extends Pick<ListValue, Members> {
    refresh(): void;
    setLimit(limit: number, options?: { loadingMore?: boolean }): void;
    isLoading: boolean;
    isRefreshing: boolean;
    isLoadingMore: boolean;
}
