import { Datum } from "plotly.js-dist-min";
import { PlotChartDataPoints } from "../hooks/usePlotChartDataSeries";

export type AggregationType = "none" | "count" | "sum" | "avg" | "min" | "max" | "median" | "mode" | "first" | "last";

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
        const key =
            xVal == null
                ? ""
                : typeof xVal === "string" || typeof xVal === "number"
                  ? xVal.toString()
                  : (xVal as Date).toISOString();
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
        aggregatedY.push(computeAggregate(yVals, aggregationType));
        aggregatedHover.push(hoverTexts.length > 0 ? hoverTexts.join("; ") : undefined);
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
            const sorted = arr.slice().sort((a, b) => a - b);
            const m = Math.floor(sorted.length / 2);
            return sorted.length % 2 === 1 ? sorted[m] : (sorted[m - 1] + sorted[m]) / 2;
        }
        case "mode": {
            const freq = new Map<number, number>();
            let best = arr[0];
            let bestCount = 0;
            arr.forEach(n => {
                const c = (freq.get(n) || 0) + 1;
                freq.set(n, c);
                if (c > bestCount) {
                    best = n;
                    bestCount = c;
                }
            });
            return best;
        }
        default:
            return NaN;
    }
}
