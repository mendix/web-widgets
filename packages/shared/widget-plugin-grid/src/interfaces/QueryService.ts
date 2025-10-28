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
    | "hasMoreItems"
    | "items";

export interface QueryService extends Pick<ListValue, Members> {
    backgroundRefresh(): void;
    hasMoreItems: boolean;
    isFetchingNextBatch: boolean;
    isFirstLoad: boolean;
    isRefreshing: boolean;
    isSilentRefresh: boolean;
    setBaseLimit(value: number): void;
    reload(): Promise<void>;
    fetchPage(params: { limit: number; offset: number; signal?: AbortSignal }): Promise<ObjectItem[]>;
}
