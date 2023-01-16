import { ListValue, ObjectItem, ValueStatus } from "mendix";
import { useRef, useMemo } from "react";
import { tuple } from "../utils/tuple";
import { throttle } from "../utils/throttle";

type GetItems = () => void;
type LoadMore = () => void;
type ReduceFn<T> = (value: T) => T;
type SetLimit = (update: ReduceFn<number>) => void;
type LazyListValue = {
    items: ObjectItem[];
    isLoading: boolean;
    isFetched: boolean;
    hasMore: boolean;
};

const incLimit = (setLimit: SetLimit, list: ListValue, pageSize: number): void => {
    setLimit(current => {
        if (list.status === ValueStatus.Available && list.hasMoreItems) {
            return current + pageSize;
        }

        return current;
    });
};

export function useLazyListValue(
    list: ListValue,
    pageSize: number,
    loadDelayTime = 1000
): [GetItems, LoadMore, LazyListValue] {
    const desiredNumberOfItems = useRef<number>(0);
    const isLoading = list.status === ValueStatus.Loading;
    const isFetched = desiredNumberOfItems.current !== 0;

    const setLimit: SetLimit = update => {
        const next = update(desiredNumberOfItems.current);
        desiredNumberOfItems.current = next;
        if (list.limit !== next) {
            list.setLimit(next);
        }
    };

    // Prevent list to load items (on initialization)
    if (list.limit !== desiredNumberOfItems.current) {
        setLimit(() => 0);
    }

    const getItems: GetItems = () => setLimit(n => (n === 0 ? pageSize : n));

    const incLimitThrottled = useMemo(() => throttle(incLimit, loadDelayTime), [loadDelayTime]);

    const loadMore: LoadMore = () => incLimitThrottled(setLimit, list, pageSize);

    return tuple(getItems, loadMore, {
        isFetched,
        isLoading,
        hasMore: !!list.hasMoreItems,
        items: list.items ?? []
    });
}
