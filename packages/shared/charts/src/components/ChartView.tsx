import { Config, Data, Layout } from "plotly.js-dist-min";
import { createElement, ReactElement, useCallback, useEffect, useMemo, useRef } from "react";
import ReactPlotlyChartComponent, { PlotParams } from "react-plotly.js";
import deepmerge from "deepmerge";
import { ChartViewProps, PlotTrace } from "./types";

const PREVENT_DEFAULT_INLINE_STYLES_BY_PASSING_EMPTY_OBJ = {};

export const ChartView = ({
    data,
    configOptions,
    layoutOptions,
    seriesOptions,
    customConfig,
    customLayout
}: ChartViewProps): ReactElement => {
    const customLayoutOptions = useMemo<Partial<Layout>>(
        () => deepmerge(layoutOptions, fromJSON(customLayout)),
        [layoutOptions, customLayout]
    );

    const customConfigOptions = useMemo<Partial<Config>>(
        () => deepmerge(configOptions, fromJSON(customConfig)),
        [configOptions, customConfig]
    );

    const plotlyData = useMemo(() => createPlotlyData(data, seriesOptions), [data, seriesOptions]);

    const handleChartClick = useCallback<NonNullable<PlotParams["onClick"]>>(
        event => {
            // As this is click handler, this event has single, "clicked" point, so we can destruct.
            const [{ curveNumber, pointIndex, pointIndices, pointNumber, pointNumbers }] = event.points;
            const index = pointIndex ?? pointNumber;
            const indices = pointIndices ?? pointNumbers;
            const itemIndex = getItemIndex(index, indices);
            const { dataSourceItems, onClick } = data[curveNumber];
            const item = dataSourceItems[itemIndex];
            onClick?.(item);
        },
        [data]
    );

    useResizeOnDataReadyEffect(data);

    return (
        <ReactPlotlyChartComponent
            className="mx-react-plotly-chart"
            data={plotlyData}
            style={PREVENT_DEFAULT_INLINE_STYLES_BY_PASSING_EMPTY_OBJ}
            config={customConfigOptions}
            layout={customLayoutOptions}
            onClick={handleChartClick}
        />
    );
};

function useResizeOnDataReadyEffect(data: unknown[]): void {
    const hasForceUpdatedReactPlotly = useRef(false);

    useEffect(() => {
        // The lib doesn't autosize the chart properly in the beginning (even with the `responsive` config),
        // so we manually trigger a refresh once when everything is ready.
        if (!hasForceUpdatedReactPlotly.current && data.length > 0) {
            window.dispatchEvent(new Event("resize"));
            hasForceUpdatedReactPlotly.current = true;
        }
    }, [data]);
}

function createPlotlyData(traces: PlotTrace[], baseOptions: Partial<Data>): Data[] {
    return traces.map(trace => {
        const item: Partial<PlotTrace> = { ...trace };
        const customTraceOptions = fromJSON(item.customSeriesOptions);
        // Sanitize trace before passing it to plotly
        delete item.customSeriesOptions;
        delete item.dataSourceItems; // Each ObjectItem has recursive refs so, we need to remove this array.

        return deepmerge.all([baseOptions, item, customTraceOptions], {
            arrayMerge: (target, source): any[] => {
                const source1 = target.filter(x => x !== undefined);
                const source2 = source.filter(x => x !== undefined);

                return deepmerge(source1, source2);
            }
        });
    });
}
function isNonEmptyString(value: undefined | null | string): value is string {
    return value !== null && value !== undefined && value !== "";
}
function ifNonEmptyStringElseEmptyObjectString(value: undefined | null | string): string {
    return isNonEmptyString(value) ? value : "{}";
}
function fromJSON(value: string | null | undefined): object {
    return JSON.parse(ifNonEmptyStringElseEmptyObjectString(value));
}

function getItemIndex(pointIndex: number | undefined, pointIndices: number[] | undefined): number {
    const index = pointIndex ?? pointIndices?.at(-1);

    if (typeof index !== "number") {
        throw new Error("Unable to get item index for given point.");
    }

    return index;
}
