import { ListValue } from "mendix";

type Members =
    | "setOffset"
    | "setSortOrder"
    | "setFilter"
    | "setLimit"
    | "requestTotalCount"
    | "totalCount"
    | "limit"
    | "offset";

export interface QueryController extends Pick<ListValue, Members> {
    refresh(): void;
    setPageSize(size: number): void;
    isLoading: boolean;
    isRefreshing: boolean;
    isFetchingNextBatch: boolean;
}
