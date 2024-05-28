import { useCallback, useEffect, useState } from "react";
import { InfiniteBodyProps, useInfiniteControl } from "@mendix/widget-plugin-grid/components/InfiniteBody";

type UseLazyLoadingProps = Pick<InfiniteBodyProps, "hasMoreItems" | "isInfinite"> & {
    isOpen: boolean;
    loadMore?: () => void;
    numberOfItems: number;
};

type UseLazyLoadingReturn = {
    isLoading: boolean;
    onScroll: (e: any) => void;
};

export function useLazyLoading(props: UseLazyLoadingProps): UseLazyLoadingReturn {
    const { hasMoreItems, isInfinite, isOpen, loadMore, numberOfItems } = props;
    const [isLoading, setIsLoading] = useState(false);
    const [firstLoad, setFirstLoad] = useState(false);
    const setPageCallback = useCallback(() => {
        if (loadMore) {
            setIsLoading(true);
            loadMore();
        }
    }, [loadMore]);

    const [trackScrolling] = useInfiniteControl({ hasMoreItems, isInfinite, setPage: setPageCallback });

    useEffect(() => {
        if (firstLoad === false && isInfinite === true && isOpen === true) {
            setFirstLoad(true);
            setPageCallback();
        }
    }, [firstLoad, isInfinite, isOpen]);

    useEffect(() => {
        setIsLoading(false);
    }, [numberOfItems]);

    return { isLoading, onScroll: trackScrolling };
}
