import { useCallback, useEffect, useState } from "react";
import { InfiniteBodyProps, useInfiniteControl } from "@mendix/widget-plugin-grid/components/InfiniteBody";
import { ListValue } from "mendix";

type UseLazyLoadingProps = Pick<InfiniteBodyProps, "hasMoreItems" | "isInfinite"> & {
    isOpen: boolean;
    loadMore?: () => void;
    datasourceFilter?: ListValue["filter"];
};

type UseLazyLoadingReturn = {
    onScroll: (e: any) => void;
};

export function useLazyLoading(props: UseLazyLoadingProps): UseLazyLoadingReturn {
    const { hasMoreItems, isInfinite, isOpen, loadMore, datasourceFilter } = props;

    const [firstLoad, setFirstLoad] = useState(false);
    const setPageCallback = useCallback(() => {
        if (loadMore) {
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
        console.log("FILTER CHANGED");

        setFirstLoad(false);
    }, [datasourceFilter]);

    return { onScroll: trackScrolling };
}
