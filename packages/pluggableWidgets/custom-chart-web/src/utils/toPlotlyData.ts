import { Data } from "plotly.js-dist-min";

/**
 * Boundary between the editable store and Plotly.
 *
 * The store keeps traces as `Record<string, unknown>[]` because user JSON is validated
 * on write (`EditableChartStore.setDataAt` parses, type-checks and warns on bad input) but
 * cannot be narrowed to Plotly's large `Data` union at that point. This helper localizes the
 * unavoidable conversion in one named, documented place instead of scattering `as Data[]` casts.
 */
export function toPlotlyData(data: Array<Record<string, unknown>>): Data[] {
    return data as Data[];
}
