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

export interface QueryController extends Pick<ListValue, Members> {
    backgroundRefresh(): void;
    setPageLimit(value: number): void;
    hasMoreItems: boolean;
    isFirstLoad: boolean;
    isRefreshing: boolean;
    isFetchingNextBatch: boolean;
}
