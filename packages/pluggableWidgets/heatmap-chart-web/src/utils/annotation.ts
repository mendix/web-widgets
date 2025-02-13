import type { Annotations } from "plotly.js-dist-min";

export function createHeatMapAnnotation(
    x?: string,
    y?: string,
    text?: string,
    colorValue?: string
): Partial<Annotations> {
    return {
        xref: "x",
        yref: "y",
        x,
        y,
        text,
        font: {
            family: "Open Sans",
            size: 14,
            color: colorValue || "#555"
        },
        showarrow: false
    };
}
