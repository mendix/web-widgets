import { useCallback, useEffect, useState } from "react";
import { InfiniteBodyProps, useInfiniteControl } from "@mendix/widget-plugin-grid/components/InfiniteBody";
import { Status } from "../helpers/types";

type UseLazyLoadingProps = Pick<InfiniteBodyProps, "hasMoreItems" | "isInfinite"> & {
    isOpen: boolean;
    loadMore?: () => void;
    searchTerm: string;
    status: Status;
};

type UseLazyLoadingReturn = {
    isLoading: boolean;
    onScroll: (e: any) => void;
};

export function useLazyLoading(props: UseLazyLoadingProps): UseLazyLoadingReturn {
    const { hasMoreItems, isInfinite, isOpen, loadMore, searchTerm, status } = props;
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
    }, [firstLoad, isInfinite, isOpen, setPageCallback]);

    useEffect(() => {
        setIsLoading(true);
    }, [searchTerm]);

    useEffect(() => {
        if (status !== "loading") {
            setIsLoading(false);
        }
    }, [status]);

    return { isLoading, onScroll: trackScrolling };
}
