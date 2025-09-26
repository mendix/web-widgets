import { ListValue, ObjectItem } from "mendix";

type Members =
    | "setOffset"
    | "setSortOrder"
    | "setFilter"
    | "setLimit"
    | "requestTotalCount"
    | "totalCount"
    | "limit"
    | "offset"
    | "items"
    | "hasMoreItems";

export interface QueryController extends Pick<ListValue, Members> {
    backgroundRefresh(): void;
    setPageSize(size: number): void;
    hasMoreItems: boolean;
    isFirstLoad: boolean;
    isRefreshing: boolean;
    isFetchingNextBatch: boolean;
    fetchPage(params: { limit: number; offset: number; signal: AbortSignal }): Promise<ObjectItem[]>;
}
