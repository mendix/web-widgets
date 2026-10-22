import { ListValue } from "mendix";
import { useEffect, useRef } from "react";
import { PlotDataSeries } from "./usePlotChartDataSeries";

/**
 * Periodically reloads the given data sources, mirroring the "Refresh time"
 * behaviour of Datagrid 2 and Gallery: the timer restarts on every data source
 * update, so a reload happens `intervalSeconds` after the most recent change.
 * Data sources that are still loading are skipped.
 */
export function useRefreshInterval(datasources: Array<ListValue | undefined>, intervalSeconds: number): void {
    const latestRef = useRef(datasources);
    const prevDatasourcesRef = useRef<Array<ListValue | undefined> | null>(null);
    const prevIntervalRef = useRef(intervalSeconds);
    const timerIdRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    // Runs after every render: reschedule only when a data source or the interval changed.
    useEffect(() => {
        latestRef.current = datasources;
        const changed =
            prevDatasourcesRef.current === null ||
            prevIntervalRef.current !== intervalSeconds ||
            !shallowEqual(prevDatasourcesRef.current, datasources);
        if (!changed) {
            return;
        }
        prevDatasourcesRef.current = datasources;
        prevIntervalRef.current = intervalSeconds;

        clearTimeout(timerIdRef.current);
        timerIdRef.current = undefined;
        if (intervalSeconds > 0) {
            timerIdRef.current = setTimeout(() => {
                for (const ds of latestRef.current) {
                    if (ds && ds.status !== "loading") {
                        ds.reload();
                    }
                }
            }, intervalSeconds * 1000);
        }
    });

    useEffect(
        () => () => {
            clearTimeout(timerIdRef.current);
            // Forget previous inputs so a remount (e.g. StrictMode) schedules the timer again.
            prevDatasourcesRef.current = null;
        },
        []
    );
}

/** Returns the active data source of each series ("static" or "dynamic" data set). */
export function seriesDataSources(
    series: Array<Pick<PlotDataSeries, "dataSet" | "staticDataSource" | "dynamicDataSource">>
): Array<ListValue | undefined> {
    return series.map(serie => (serie.dataSet === "static" ? serie.staticDataSource : serie.dynamicDataSource));
}

function shallowEqual<T>(a: T[], b: T[]): boolean {
    return a.length === b.length && a.every((value, index) => value === b[index]);
}
