import { ListValue } from "mendix";

type Members =
    | "setOffset"
    | "setSortOrder"
    | "setFilter"
    | "setLimit"
    | "requestTotalCount"
    | "totalCount"
    | "limit"
    | "offset"
    | "hasMoreItems";

export interface QueryService extends Pick<ListValue, Members> {
    backgroundRefresh(): void;
    datasource: ListValue;
    hasMoreItems: boolean;
    isFetchingNextBatch: boolean;
    isFirstLoad: boolean;
    isRefreshing: boolean;
    isSilentRefresh: boolean;
    setBaseLimit(value: number): void;
}
