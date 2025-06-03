import { Datum } from "plotly.js-dist-min";
import { PlotChartDataPoints } from "../hooks/usePlotChartDataSeries";

export type AggregationType = "none" | "count" | "sum" | "avg" | "min" | "max" | "median" | "mode" | "first" | "last";

function getXValueKey(xVal: Datum | null): string {
    if (xVal == null) {
        return "";
    }
    if (typeof xVal === "string" || typeof xVal === "number") {
        return xVal.toString();
    }
    // Assuming it's a Date object if not string, number, or null
    return (xVal as Date).toISOString();
}

export function aggregateDataPoints(
    aggregationType: AggregationType,
    points: PlotChartDataPoints
): PlotChartDataPoints {
    if (aggregationType === "none") {
        return points;
    }

    type GroupEntry = {
        yVals: number[];
        hoverTexts: string[];
    };
    const groups = new Map<string, GroupEntry>();
    const originalHover = points.hovertext;

    points.x.forEach((xVal, i) => {
        const key = getXValueKey(xVal);
        const yVal = points.y[i] as number | undefined;
        if (yVal == null) {
            return; // skip nulls
        }
        let entry = groups.get(key);
        if (!entry) {
            entry = { yVals: [], hoverTexts: [] };
            groups.set(key, entry);
        }
        entry.yVals.push(yVal);
        if (originalHover && originalHover[i]) {
            entry.hoverTexts.push(originalHover[i]!);
        }
    });

    const aggregatedX: Datum[] = [];
    const aggregatedY: Datum[] = [];
    const aggregatedHover: Array<string | undefined> = [];

    for (const [key, { yVals, hoverTexts }] of groups) {
        aggregatedX.push(key);
        const aggregatedValue = computeAggregate(yVals, aggregationType);
        aggregatedY.push(aggregatedValue);

        const aggregatedHoverText = yVals.length > 1 ? aggregatedValue.toLocaleString() : hoverTexts[0];

        aggregatedHover.push(aggregatedHoverText);
    }

    const hasText = aggregatedHover.some(text => text !== undefined && text !== "");
    return {
        ...points,
        x: aggregatedX,
        y: aggregatedY,
        hovertext: hasText ? (aggregatedHover as string[]) : undefined,
        hoverinfo: hasText ? "text" : "none"
    };
}

function computeAggregate(arr: number[], type: AggregationType): number {
    if (arr.length === 0) {
        return NaN;
    }
    switch (type) {
        case "count":
            return arr.length;
        case "sum":
            return arr.reduce((a, b) => a + b, 0);
        case "avg":
            return arr.reduce((a, b) => a + b, 0) / arr.length;
        case "min":
            return Math.min(...arr);
        case "max":
            return Math.max(...arr);
        case "first":
            return arr[0];
        case "last":
            return arr[arr.length - 1];
        case "median": {
            const sorted = [...arr].sort((a, b) => a - b);
            const m = Math.floor(sorted.length / 2);
            return sorted.length % 2 === 1 ? sorted[m] : (sorted[m - 1] + sorted[m]) / 2;
        }
        case "mode": {
            if (arr.length === 0) return NaN;
            const freq = new Map<number, number>();
            let maxFreq = 0;
            let mode = arr[0];

            for (const n of arr) {
                const count = (freq.get(n) || 0) + 1;
                freq.set(n, count);
                if (count > maxFreq) {
                    maxFreq = count;
                    mode = n;
                }
            }
            return mode;
        }
        default:
            console.warn(`Unknown aggregation type: ${type}`);
            return NaN;
    }
}
