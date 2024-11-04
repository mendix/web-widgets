import { ListValue, ValueStatus } from "mendix";
import { useEffect, useState } from "react";

type UseRefreshReloadProps = {
    datasource: ListValue;
    refreshInterval: number;
};

export function useRefreshReload({ datasource, refreshInterval }: UseRefreshReloadProps): { isRefreshing: boolean } {
    const [isRefreshing, setRefreshing] = useState(false);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (refreshInterval > 0) {
            timer = setTimeout(() => {
                datasource.reload();
                setRefreshing(true);
            }, refreshInterval * 1000);
        }
        return () => {
            if (timer) {
                clearTimeout(timer);
            }
        };
    }, [datasource, refreshInterval]);

    useEffect(() => {
        if (datasource.status === ValueStatus.Available) {
            setRefreshing(false);
        }
    }, [datasource]);

    return { isRefreshing };
}
