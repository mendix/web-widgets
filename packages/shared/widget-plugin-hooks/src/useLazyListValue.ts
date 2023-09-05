import type { ListValue, ObjectItem } from "mendix";
import { useRef, useMemo, useEffect } from "react";
import { tuple } from "@mendix/widget-plugin-platform/utils/tuple";
import { throttle } from "@mendix/widget-plugin-platform/utils/throttle";

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
        if (list.status === "available" && list.hasMoreItems) {
            return current + pageSize;
        }

        return current;
    });
};

function useIncLimitThrottled(wait: number): typeof incLimit {
    const [incLimitThrottled, abort] = useMemo(() => throttle(incLimit, wait), [wait]);

    useEffect(() => abort, [abort]);

    return incLimitThrottled;
}

export function useLazyListValue(
    list: ListValue,
    pageSize = 100,
    loadDelayTime = 1000
): [GetItems, LoadMore, LazyListValue] {
    const desiredNumberOfItems = useRef<number>(0);
    const isLoading = list.status === "loading";
    const isFetched = desiredNumberOfItems.current !== 0;

    const setLimit: SetLimit = update => {
        const next = update(desiredNumberOfItems.current);
        desiredNumberOfItems.current = next;
        if (list.limit !== next) {
            list.setLimit(next);
        }
    };

    const incLimitWithDelay = useIncLimitThrottled(loadDelayTime);

    const getItems: GetItems = () => setLimit(n => (n === 0 ? pageSize : n));

    const loadMore: LoadMore = () => incLimitWithDelay(setLimit, list, pageSize);

    // Prevent list data fetching on first mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => setLimit(() => 0), []);

    return tuple(getItems, loadMore, {
        isFetched,
        isLoading,
        hasMore: !!list.hasMoreItems,
        items: list.items ?? []
    });
}
